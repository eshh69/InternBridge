# InternBridge — AI Coding Agent Guidelines (`AGENTS.md`)

This document is the **mandatory master instruction file** for all AI coding agents (and developers) working on the **InternBridge** project. Every AI agent must read and adhere to these guidelines before inspecting, planning, or modifying any code in this repository.

---

## 1. Project Context & Golden Rules

- **One Integrated Application:** InternBridge is **ONE single, coherent full-stack application** built cooperatively by a team of five members. It is **NOT** five isolated apps.
- **Single Source of Truth:** The files in `docs/` (`ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `API_CONTRACTS.md`, `SHARED_COMPONENTS.md`, `DECISIONS.md`) and the project proposal define all technical contracts. Private agent memory is never a source of truth.
- **Do Not Reinvent the Wheel:** Never create competing authentication logic, duplicate Mongoose models, separate Axios clients, or competing CSS styling solutions. Use the existing shared infrastructure in `client/src/` and `server/src/`.
- **Preserve Documentation & Code:** Never silently discard existing working code or documentation. Any proposed change to shared contracts must be reviewed and documented in `docs/DECISIONS.md`.

---

## 2. Approved Technology Stack

| Layer | Approved Technology | Restrictions / Notes |
| :--- | :--- | :--- |
| **Frontend** | React.js (v18+) + Vite | JavaScript (JSX), Tailwind CSS. No additional CSS frameworks without approval. |
| **Backend** | Node.js + Express.js | REST APIs, modular route architecture. |
| **Database** | MongoDB Atlas (via Mongoose) | Schemas centralized in `server/src/models/`. |
| **File Storage** | Supabase Storage | Centralized via `server/src/services/storageService.js`. |
| **Authentication** | JWT + bcrypt | Stateless auth, role-based guards (`student`, `company`, `reviewer`, `admin`). |
| **Real-time** | Socket.IO | Centralized in `server/src/socket/` and `client/src/hooks/useSocket.js`. |
| **Version Control** | Git + GitHub | Feature branch workflow, pull requests to `main`. |
| **Cost Target** | Free-tier / Open Source | Zero direct cost (Vercel frontend, Render backend, MongoDB free tier). |

---

## 3. Team Organization & Feature Boundaries

Each team member has strict ownership over their assigned feature module directories. Feature logic **must stay inside these directories**.

| Member & Reg No. | Module Name | Frontend Directory | Backend Directory |
| :--- | :--- | :--- | :--- |
| **Member 1**<br>`SEU/IS/22/ICT/032` | **Student Portfolio & Real-time Chat** | `client/src/features/student-portfolio/` | `server/src/modules/student-portfolio/` |
| **Member 2**<br>`SEU/IS/22/ICT/033` | **Company & Internship Management** | `client/src/features/company-internships/` | `server/src/modules/company-internships/` |
| **Member 3**<br>`SEU/IS/22/ICT/035` | **Search & Matching Engine** | `client/src/features/search-matching/` | `server/src/modules/search-matching/` |
| **Member 4**<br>`SEU/IS/22/ICT/030` | **Application & Recruitment** | `client/src/features/applications/` | `server/src/modules/applications/` |
| **Member 5**<br>`SEU/IS/22/ICT/057` | **Verification & Rating System** | `client/src/features/verification-rating/` | `server/src/modules/verification-rating/` |

### Shared Resources (Coordination Required):
Modifications to shared folders require team/integration lead approval:
- **Frontend Shared:** `client/src/app/`, `client/src/components/`, `client/src/services/`, `client/src/hooks/`, `client/src/types/`, `client/src/lib/`
- **Backend Shared:** `server/src/config/`, `server/src/middleware/`, `server/src/models/`, `server/src/routes/`, `server/src/services/`, `server/src/utils/`, `server/src/socket/`

---

## 4. Mandatory AI Agent Workflow

Before generating or editing any code, the AI agent must complete these steps:

1. **Read Rules:** Read `AGENTS.md` and the relevant documentation in `docs/`.
2. **Inspect Code:** Check existing implementations in both the assigned module and shared utilities.
3. **Check Dependencies:** Verify which models, APIs, and shared components are consumed.
4. **Identify Allowed Files:** Only edit files within your assigned feature folder and your module's registration files.
5. **State the Plan:** Present a concise implementation plan before generating complex changes.
6. **Implement Conforming Code:**
   - Adhere to the API contracts in `docs/API_CONTRACTS.md`.
   - Adhere to the database schemas in `docs/DATABASE_SCHEMA.md`.
   - Use the shared API client (`apiClient.js`) and UI components (`client/src/components/ui/`).
7. **Test & Verify:** Run available tests, lint checks, and build steps. Never report that tests passed without executing them.
8. **Final Diff Inspection:** Verify that no unrelated files, credentials, or `.env` entries are modified.

---

## 5. Coding & API Standards

### Standard API Response Envelope:
All backend endpoints must return JSON responses adhering to this standard format:

```json
// Success Response (HTTP 200, 201)
{
  "success": true,
  "message": "Resource retrieved or created successfully",
  "data": { ... }
}

// Error Response (HTTP 400, 401, 403, 404, 500)
{
  "success": false,
  "message": "Human-readable error description",
  "errors": [ ... ] // Optional detailed field validation errors
}
```

### Git & Security Conventions:
- **Never commit secrets:** Never commit `.env` files, JWT secrets, database connection strings, or Supabase service keys.
- **Descriptive Commits:** Use conventional commits: `feat(student-portfolio): add skill tag selector`, `fix(auth): correct token expiration handling`.
- **No Direct Push to `main`:** All work must be conducted on feature branches (`feature/<module-name>`) and integrated via Pull Requests.
