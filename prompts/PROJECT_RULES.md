# InternBridge — AI Agent Project Rules (`PROJECT_RULES.md`)

These rules must be attached or referenced in any task given to an AI agent in this repository.

1. **Architecture & Scope Compliance:**
   - Adhere strictly to the boundaries defined in `AGENTS.md` and `docs/ARCHITECTURE.md`.
   - Work strictly within your assigned feature directories:
     - Member 1: `client/src/features/student-portfolio/` & `server/src/modules/student-portfolio/`
     - Member 2: `client/src/features/company-internships/` & `server/src/modules/company-internships/`
     - Member 3: `client/src/features/search-matching/` & `server/src/modules/search-matching/`
     - Member 4: `client/src/features/applications/` & `server/src/modules/applications/`
     - Member 5: `client/src/features/verification-rating/` & `server/src/modules/verification-rating/`

2. **No Breaking Shared Contracts:**
   - Never alter models in `server/src/models/` without prior ADR approval in `docs/DECISIONS.md`.
   - Never modify endpoints or payload shapes without updating `docs/API_CONTRACTS.md`.
   - Never create duplicate Axios clients or auth handlers.

3. **Code Quality & Consistency:**
   - Use ESModules (`import` / `export`).
   - Use functional React components with hooks.
   - Use Tailwind CSS for all styling.
   - Handle all edge cases: loading state, empty state, and error message rendering.
   - Validate incoming request data on both client and server.

4. **Git & Security:**
   - Never commit `.env` or any sensitive API keys/passwords.
   - Work on your designated branch: `feature/<module-name>`.
   - Keep commits small, descriptive, and atomic.
