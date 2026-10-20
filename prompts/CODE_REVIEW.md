# InternBridge — Pull Request & Code Review Checklist (`CODE_REVIEW.md`)

Before any Pull Request is approved and merged into `main`, the reviewer and author must complete this checklist.

---

### 1. Scope & File Boundaries
- [ ] Are all modifications restricted to the author's assigned feature directories (`client/src/features/<module>` and `server/src/modules/<module>`)?
- [ ] If shared files (`client/src/components/`, `server/src/middleware/`, `server/src/models/`, etc.) were modified, was prior approval obtained?
- [ ] Are there any accidental files committed (e.g. `.env`, `.DS_Store`, build outputs, logs)?

### 2. Contract & Schema Compliance
- [ ] Do backend endpoints adhere strictly to the paths, methods, and schemas in `docs/API_CONTRACTS.md`?
- [ ] Does the response envelope follow `{ success: true, message: "...", data: { ... } }`?
- [ ] Do database operations conform to the Mongoose models in `docs/DATABASE_SCHEMA.md`?

### 3. Security & Access Control
- [ ] Is authentication enforced using `protect` middleware on all non-public endpoints?
- [ ] Is Role-Based Access Control (`authorize(...)`) enforced where appropriate?
- [ ] Are passwords or sensitive credentials absent from code, logs, and commit history?
- [ ] Are file uploads restricted to allowed MIME types (e.g. PDF, PNG, JPG) and file sizes?

### 4. UI & User Experience
- [ ] Does the UI handle loading states (spinners/skeletons)?
- [ ] Does the UI handle error states gracefully (user-friendly alerts, field validation)?
- [ ] Does the UI handle empty states (e.g. no internships found, no applications yet)?
- [ ] Is the design responsive and consistent with Tailwind styling?

### 5. Code Quality & Integration
- [ ] Does the code reuse existing shared components and utilities instead of creating duplicates?
- [ ] Does the backend start without errors?
- [ ] Does the frontend build succeed (`npm run build`) without errors?
