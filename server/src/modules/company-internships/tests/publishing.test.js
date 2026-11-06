import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';
import { prepareInternship } from '../../../../../client/src/features/company-internships/internshipForm.mjs';

// Set before loading dotenv/app. Never use the developer's configured database.
process.env.MONGO_URI = `mongodb://127.0.0.1:27017/internbridge_publish_test_${Date.now()}`;
const { default: app } = await import('../../../app.js');
const { Internship } = await import('../../../models/Internship.js');
await mongoose.connect(process.env.MONGO_URI);
const server = http.createServer(app);
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/api/v1`;
let passed = 0;
const check = (condition, message) => { assert.ok(condition, message); passed++; console.log(`PASS: ${message}`); };
async function request(path, method = 'GET', body, token) {
  const response = await fetch(base + path, { method, headers: {
    'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }, body: body ? JSON.stringify(body) : undefined });
  return { status: response.status, body: await response.json() };
}
try {
  const form = { title: 'Publishing regression', area: 'Software Engineering', location: 'Colombo', locationType: 'Hybrid', durationMonths: 6, openPositions: 2, stipendPaid: true, stipendAmount: 40000, stipendCurrency: 'LKR', deadline: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10), description: 'Develop production web applications', qualificationsText: 'ICT undergraduate', status: 'published' };
  const build = (overrides = {}, status = 'published') => prepareInternship({ ...form, ...overrides }, ['React'], 'Node.js, React', status);
  check(!build({ title: '', description: '' }).payload, 'Missing required fields blocked');
  check(!build({ deadline: '2020-01-01' }).payload, 'Past deadline blocked');
  check(!build({ stipendAmount: -1 }).payload && !build({ stipendAmount: 'bad' }).payload, 'Invalid compensation blocked without coercion');
  check(!build({ durationMonths: 0 }).payload && !build({ openPositions: 1.5 }).payload, 'Invalid duration and positions blocked');
  check(build().payload.requiredSkills.join(',') === 'react,node.js', 'Pending skills included and normalized');
  const company = await request('/auth/register', 'POST', { name: 'Publishing Test Company', email: `publish.${Date.now()}@example.com`, password: 'Password123!', role: 'company' });
  assert.equal(company.status, 201);
  const token = company.body.data.token;
  const student = await request('/auth/register', 'POST', { name: 'Publishing Test Student', email: `student.${Date.now()}@example.com`, password: 'Password123!', role: 'student' });
  assert.equal(student.status, 201);
  check((await request('/internships', 'POST', build().payload)).status === 401, 'Unauthenticated creation rejected');
  check((await request('/internships', 'POST', build().payload, student.body.data.token)).status === 403, 'Non-company creation rejected');
  for (const payload of [{ ...build().payload, title: '' }, { ...build().payload, deadline: '2020-01-01' }, { ...build().payload, stipend: { isPaid: true, amount: -1 } }]) {
    check((await request('/internships', 'POST', payload, token)).status === 400, 'Backend independently rejects invalid payload');
  }
  const paid = await request('/internships', 'POST', build().payload, token);
  check(paid.status === 201 && paid.body.data.status === 'published', 'Paid internship published');
  const unpaid = await request('/internships', 'POST', build({ stipendPaid: false }).payload, token);
  check(unpaid.status === 201 && unpaid.body.data.stipend.amount === 0, 'Unpaid internship published');
  const draft = await request('/internships', 'POST', build({ title: 'Draft regression' }, 'draft').payload, token);
  check(draft.status === 201 && draft.body.data.status === 'draft', 'Draft saved');
  const stored = await Internship.findById(draft.body.data._id).lean();
  check(stored.status === 'draft' && stored.company.toString() === paid.body.data.company, 'MongoDB persistence and company ownership verified');
  const search = await request('/search/internships');
  check(search.body.data.items.some(i => i._id === paid.body.data._id) && !search.body.data.items.some(i => i._id === draft.body.data._id), 'Public search includes published listings and excludes drafts');
  const updated = await request(`/internships/${draft.body.data._id}`, 'PUT', build({ title: 'Edited draft' }, 'draft').payload, token);
  check(updated.status === 200 && updated.body.data.status === 'draft', 'Draft can be edited without publishing');
  const published = await request(`/internships/${draft.body.data._id}/status`, 'PATCH', { status: 'published' }, token);
  check(published.status === 200 && (await Internship.findById(draft.body.data._id)).status === 'published', 'Existing draft published and persisted');
  const dashboard = await request('/internships/my', 'GET', undefined, token);
  check(dashboard.body.data.internships.length === 3 && dashboard.body.data.stats.published === 3 && dashboard.body.data.stats.draft === 0, 'Company dashboard listings and statistics refreshed');
  check((await request('/search/internships')).body.data.items.some(i => i._id === draft.body.data._id), 'Published draft visible in public search');
  console.log(`${passed} publishing checks passed`);
} finally {
  await new Promise(resolve => server.close(resolve));
  await mongoose.disconnect();
}
