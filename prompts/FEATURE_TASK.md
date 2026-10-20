# InternBridge — Standard Feature Task Template (`FEATURE_TASK.md`)

Use this template when assigning or prompting an AI coding agent to implement a feature for a team member.

---

```markdown
PROJECT: InternBridge
MEMBER: [e.g. S.A.I.C. Kumara - SEU/IS/22/ICT/032]
ASSIGNED MODULE: [e.g. Module 1 - Student Profile & Portfolio Management]
GIT BRANCH: [e.g. feature/student-portfolio]
TASK: [e.g. Implement Student Portfolio Edit Form and CV Upload]

REQUIREMENTS:
- [Specify requirements from the approved project proposal and docs/API_CONTRACTS.md]

ACCEPTANCE CRITERIA:
- [ ] Feature functions end-to-end as specified.
- [ ] Inputs are validated on frontend and backend.
- [ ] Error, loading, and empty states are gracefully rendered.
- [ ] Standard API response envelopes are used.
- [ ] Code strictly stays within allowed file boundaries.

ALLOWED FILES:
- client/src/features/[assigned-module]/*
- server/src/modules/[assigned-module]/*
- Relevant route mounting in server/src/routes/ or client/src/app/routes.jsx

SHARED DEPENDENCIES:
- Shared UI: client/src/components/ui/
- API Client: client/src/services/apiClient.js
- Auth Context: client/src/app/AuthContext.jsx
- Models: server/src/models/
- Middleware: server/src/middleware/auth.js

DOCUMENTATION TO READ:
- AGENTS.md
- docs/ARCHITECTURE.md
- docs/DATABASE_SCHEMA.md
- docs/API_CONTRACTS.md
- docs/SHARED_COMPONENTS.md

IMPLEMENTATION RULES:
1. Inspect existing files before editing.
2. Adhere strictly to the approved database schema and API contracts.
3. Reuse existing shared UI components and Axios client.
4. Do not touch another member's feature folder.
5. Report any conflicts or missing dependencies before writing code.
6. Verify code functionality and test results before concluding.

FINAL REPORT REQUIRED:
- Files modified or created.
- Functionality implemented.
- Endpoints and models utilized.
- Tests/validation performed.
- Remaining dependencies or notes for the integration lead.
```
