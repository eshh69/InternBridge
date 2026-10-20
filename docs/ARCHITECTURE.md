# InternBridge — System Architecture Specification (`ARCHITECTURE.md`)

## 1. Architectural Overview

InternBridge is designed following a **Three-Tier Modular Architecture** composed of:
1. **Presentation Layer (Frontend):** Single Page Application (SPA) built with React.js and Vite, styled using Tailwind CSS.
2. **Application / Business Logic Layer (Backend):** Node.js runtime with Express.js framework exposing a RESTful API and WebSocket endpoints via Socket.IO.
3. **Data & Storage Layer:** MongoDB Atlas for document storage and Supabase Storage for binary files (resumes, certificates, profile images).

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│                 React.js + Vite SPA (Tailwind CSS)                     │
│                                                                        │
│  [Student UI]    [Company UI]    [Reviewer UI]    [Admin Dashboard]    │
│  Portfolio Mgmt  Internship Post  Evaluations      User Moderation     │
│  Search & Match  Applicant Track  Ratings & Badges Verifications       │
│  Real-Time Chat  Direct Messages  Activity Feed    Platform Metrics    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP REST & WebSocket (Socket.IO)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       BUSINESS LOGIC / API LAYER                       │
│                         Node.js + Express.js                           │
│                                                                        │
│  ┌─────────────────────── Shared Infrastructure ─────────────────────┐ │
│  │ JWT Authentication & RBAC Middleware  │ Error Handler Middleware │ │
│  │ Supabase File Storage Service         │ Socket.IO Event Engine   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌──────────────────────── Functional Modules ───────────────────────┐ │
│  │ Module 1: Student Portfolio & Real-time Chat (032)                │ │
│  │ Module 2: Company & Internship Management (033)                   │ │
│  │ Module 3: Search & Algorithmic Matching (035)                     │ │
│  │ Module 4: Application & Recruitment Workflow (030)                │ │
│  │ Module 5: Verification & Rating System (057)                      │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │ Mongoose ODM                  │ REST / Storage API
                    ▼                               ▼
┌───────────────────────────────────────┐  ┌─────────────────────────────┐
│           DATABASE LAYER              │  │     OBJECT STORAGE LAYER    │
│            MongoDB Atlas              │  │       Supabase Storage      │
│  (Users, Profiles, Companies, Posts,  │  │ (CV PDFs, Certificates,     │
│   Applications, Reviews, Messages)    │  │  Profile Images)            │
└───────────────────────────────────────┘  └─────────────────────────────┘
```

---

## 2. Layer Responsibilities & Boundaries

### 2.1 Frontend Layer (`client/`)
- **Single Page Application:** Powered by React + Vite.
- **Routing:** Managed via React Router v6 in `client/src/app/routes.jsx`.
- **State Management:**
  - `AuthContext`: Centralizes current user state, JWT token, login, logout, and role inspection.
  - Local state & hooks for feature modules.
- **API Client:** Single centralized Axios client in `client/src/services/apiClient.js` that automatically attaches the JWT Bearer token and redirects on 401 unauthorized errors.
- **Shared UI:** Standardized reusable components in `client/src/components/ui/` (Buttons, Inputs, Modals, Cards, Badges, Loaders).
- **Feature Modules (`client/src/features/`):** Encapsulated components, pages, and hooks per developer module.

### 2.2 Backend Layer (`server/`)
- **Server Entrypoint:** `server/src/server.js` initializes Express, attaches middleware, mounts routes, initializes Socket.IO, and listens on the configured PORT.
- **Central Express App:** `server/src/app.js` configures CORS, JSON parsing, security headers, and health checks.
- **Routing Convention:** All API endpoints are mounted under `/api/v1/`:
  - `/api/v1/auth` -> Core Authentication & User Management
  - `/api/v1/students` -> Module 1 (Student Profiles)
  - `/api/v1/companies` & `/api/v1/internships` -> Module 2 (Company & Internships)
  - `/api/v1/search` & `/api/v1/match` -> Module 3 (Search & Matching)
  - `/api/v1/applications` -> Module 4 (Application Lifecycle)
  - `/api/v1/verifications` & `/api/v1/reviews` -> Module 5 (Verification & Ratings)
  - `/api/v1/messages` & `/api/v1/notifications` -> Module 1 / Real-time Services
- **Database Access:** Exclusively through centralized Mongoose models in `server/src/models/`.

### 2.3 Storage Layer
- **Database:** MongoDB Atlas M0 cluster.
- **Document Schemas:** Formal schemas defined with Mongoose adhering to `docs/DATABASE_SCHEMA.md`.
- **Media / Documents:** Supabase Storage bucket (`internbridge-uploads`) with organized folder structure:
  - `resumes/{studentId}/{timestamp}_{filename}`
  - `certificates/{studentId}/{timestamp}_{filename}`
  - `avatars/{userId}/{timestamp}_{filename}`
  - `verification_proofs/{targetId}/{timestamp}_{filename}`

---

## 3. Authentication & Authorization Flow

```
[Client]                      [Express /api/v1/auth]             [MongoDB Atlas]
   │                                   │                                │
   │ 1. POST /login (email, password)  │                                │
   ├──────────────────────────────────>│                                │
   │                                   │ 2. Find user & verify bcrypt   │
   │                                   ├───────────────────────────────>│
   │                                   │<───────────────────────────────┤
   │                                   │ 3. Sign JWT (userId, role)     │
   │ 4. Return token & user profile    │                                │
   │<──────────────────────────────────┤                                │
   │                                   │                                │
   │ 5. GET /api/v1/protected-resource │                                │
   │    Authorization: Bearer <token>  │                                │
   ├──────────────────────────────────>│                                │
   │                                   │ 6. authMiddleware (verify JWT) │
   │                                   │ 7. roleGuard (check role)      │
   │ 8. Success response (200 JSON)    │                                │
   │<──────────────────────────────────┤                                │
```

### Roles & Access Matrix:
- `student`: Manage own portfolio, search internships, view match scores, apply for jobs, chat with companies, receive reviews.
- `company`: Manage company profile, create/update/close internship posts, search candidates, review applications, shortlist/reject candidates, chat with applicants.
- `reviewer`: Submit verified evaluations and ratings for students and companies.
- `admin`: Moderate users, approve/reject reviewer and company verification requests, oversee platform integrity.

---

## 4. Real-time Communication Architecture (Socket.IO)

- Socket.IO server mounted on the shared Node HTTP server (`server/src/socket/index.js`).
- **Connection Handshake:** Socket handshake validates JWT token. Sockets without a valid token are rejected.
- **Room Strategy:**
  - `user_{userId}`: Personal notification room for instant notifications (e.g. application status change, review received).
  - `chat_{conversationId}`: Room for active real-time messaging between a student and a company.
- **Message Persistence:** All chat messages are validated and saved to MongoDB `messages` collection before or simultaneously with broadcasting to the room.

---

## 5. Integration Responsibilities & Cross-Cutting Concerns

- **Integration Lead:** Ensures that shared infrastructure (Auth, Database connection, Error Handling, Routing conventions) remains uniform and that pull requests from different module branches integrate seamlessly without breaking existing functionality.
- **Schema & Contract Synchronization:** Any change to an entity model or API contract must be proposed, reviewed, and updated in `docs/` before code changes are merged.
