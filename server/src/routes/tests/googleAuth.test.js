import assert from 'node:assert/strict';
import express from 'express';
process.env.SUPABASE_URL = 'https://auth-test.supabase.co';
process.env.SUPABASE_KEY = 'test-key';
const { default: router } = await import('../authRoutes.js');
const { supabase } = await import('../../config/supabase.js');
import { User } from '../../models/User.js';
const app = express();
app.use(express.json());
app.use('/auth', router);
app.use((err, req, res, next) => res.status(500).json({ message: err.message }));
const server = app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}/auth`;
const originalFind = User.findOne;
const originalGet = supabase?.auth.getUser;
let lookups = 0;
User.findOne = async query => {
  lookups++;
  assert.equal(query.$or[0].email, 'verified@example.com');
  return { _id: '507f1f77bcf86cd799439011', name: 'Verified', email: 'verified@example.com', role: 'student', status: 'active', supabaseId: 'verified-id', avatarUrl: 'avatar', age: 22, phone: '123' };
};
async function post(route, body) {
  const res = await fetch(base + route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { status: res.status, body: await res.json() };
}
try {
  assert.equal((await post('/register', {})).status, 400);
  assert.equal((await post('/register', { authProvider: 'google', email: 'fake@example.com' })).status, 400);
  assert.equal((await post('/supabase-login', { email: 'fake@example.com' })).status, supabase ? 401 : 503);
  assert.equal(lookups, 0);
  if (supabase) {
    supabase.auth.getUser = async () => ({ data: { user: null }, error: new Error('expired') });
    assert.equal((await post('/supabase-login', { accessToken: 'expired' })).status, 401);
    assert.equal(lookups, 0);
    supabase.auth.getUser = async token => {
      assert.equal(token, 'verified-token');
      return { data: { user: { id: 'verified-id', email: 'verified@example.com', email_confirmed_at: '2026-01-01', identities: [{ provider: 'google' }], user_metadata: {} } }, error: null };
    };
    const result = await post('/supabase-login', { accessToken: 'verified-token', email: 'forged@example.com', supabaseId: 'forged', role: 'admin' });
    assert.equal(result.status, 200);
    assert.equal(result.body.data.user.email, 'verified@example.com');
    assert.equal(result.body.data.user.role, 'student');
    assert.ok(result.body.data.token);
    assert.equal(lookups, 1);
  } else {
    throw new Error('Server Supabase configuration missing: verified-session tests cannot run');
  }
  console.log('PASS: registration validation, OAuth registration rejection, missing/expired token rejection, verified identity, existing role preservation');
} finally {
  User.findOne = originalFind;
  if (supabase) supabase.auth.getUser = originalGet;
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
