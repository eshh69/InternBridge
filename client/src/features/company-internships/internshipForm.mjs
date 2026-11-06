// Keep form validation explicit: never silently replace invalid user input.
export function prepareInternship(form, skills, skillInput = '', status = form.status, now = new Date()) {
  const errors = {};
  for (const [field, label] of [['title', 'Internship title'], ['area', 'Area / discipline'], ['location', 'Location'], ['description', 'Job description']]) {
    if (!form[field]?.trim()) errors[field] = `${label} is required.`;
  }
  const requiredSkills = [...new Set([...skills, ...skillInput.split(',')].map(s => s.trim().toLowerCase()).filter(Boolean))];
  if (!requiredSkills.length) errors.requiredSkills = 'Add at least one required skill.';
  if (!['On-site', 'Remote', 'Hybrid'].includes(form.locationType)) errors.locationType = 'Select a valid work arrangement.';
  for (const [field, label] of [['durationMonths', 'Duration'], ['openPositions', 'Open positions']]) {
    if (!Number.isInteger(Number(form[field])) || Number(form[field]) < 1) errors[field] = `${label} must be a whole number of at least 1.`;
  }
  const amount = Number(form.stipendAmount);
  if (form.stipendPaid && (String(form.stipendAmount).trim() === '' || !Number.isFinite(amount) || amount < 0)) errors.stipendAmount = 'Enter a valid compensation amount of 0 or more.';
  if (!form.stipendCurrency?.trim()) errors.stipendCurrency = 'Select a currency.';
  const deadline = new Date(form.deadline);
  if (!form.deadline || !Number.isFinite(deadline.getTime()) || deadline <= now) errors.deadline = 'Application deadline must be a future date.';
  if (!['draft', 'published', 'closed'].includes(status)) errors.status = 'Select a valid listing status.';
  if (Object.keys(errors).length) return { errors };
  return { errors, payload: {
    title: form.title.trim(), area: form.area.trim(), location: form.location.trim(),
    description: form.description.trim(), locationType: form.locationType,
    durationMonths: Number(form.durationMonths), openPositions: Number(form.openPositions),
    stipend: { isPaid: form.stipendPaid, amount: form.stipendPaid ? amount : 0, currency: form.stipendCurrency.trim() },
    requiredSkills, deadline: deadline.toISOString(), status,
    qualifications: form.qualificationsText.split('\n').map(q => q.trim()).filter(Boolean),
  } };
}
