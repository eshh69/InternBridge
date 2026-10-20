# InternBridge — Architecture Decision Records (`DECISIONS.md`)

This log records all formal architectural decisions, their justifications, affected modules, and approval status.

---

### ADR 001: Monorepo Single Application Architecture
- **Date:** 2026-10-20
- **Status:** Approved
- **Decision:** The project will be built as a single integrated monorepo containing `/client` (React + Vite) and `/server` (Node.js + Express) under one repository.
- **Reason:** To prevent five fragmented apps, streamline team coordination, share API types/contracts easily, and allow continuous end-to-end integration.
- **Affected Modules:** All modules.

---

### ADR 002: Centralized Authentication & Shared User Model
- **Date:** 2026-10-20
- **Status:** Approved
- **Decision:** User authentication (JWT + bcrypt) and the core `User` model are designated as shared foundation infrastructure. Individual members will not create competing user models.
- **Reason:** Every module depends on knowing the authenticated user's ID, role, and permissions. Centralizing auth avoids conflicting schemas and security bugs.
- **Affected Modules:** All modules.

---

### ADR 003: Single Supabase Storage Service
- **Date:** 2026-10-20
- **Status:** Approved
- **Decision:** All binary file uploads (student CVs, certificates, company logos, verification documents) will be processed through a single shared backend service (`server/src/services/storageService.js`) using the free Supabase Storage tier.
- **Reason:** Avoids having multiple file upload implementations or storing binary files directly in MongoDB Atlas. Keeps code DRY and maintainable.
- **Affected Modules:** Module 1 (Student Profiles), Module 2 (Company), Module 4 (Applications), Module 5 (Verifications).

---

### ADR 004: Standard API Response Envelope
- **Date:** 2026-10-20
- **Status:** Approved
- **Decision:** All REST endpoints must return responses encapsulated in `{ success: boolean, message: string, data: any, errors?: any[] }`.
- **Reason:** Frontend components and the centralized Axios interceptor can predict and handle success, empty, and error states uniformly.
- **Affected Modules:** All modules.

---

### ADR 005: Algorithmic Matching Engine Strategy
- **Date:** 2026-10-20
- **Status:** Approved
- **Decision:** The matching score (0–100%) will be calculated using a normalized skill overlap algorithm:
  $$\text{Match Score} = \left(\frac{|\text{Student Skills} \cap \text{Required Skills}|}{|\text{Required Skills}|}\right) \times 100$$
  with additional weighting for education qualification and field of study.
- **Reason:** Provides a transparent, deterministic matching calculation satisfying course criteria without requiring external paid ML APIs.
- **Affected Modules:** Module 3 (Search & Matching), Module 1 (Student Portfolio), Module 2 (Internships).

---

### ADR 006: Socket.IO Room-Based Real-time Communication
- **Date:** 2026-10-20
- **Status:** Approved
- **Decision:** Socket.IO connections will authenticate using JWT during the handshake. Clients will join personal notification rooms (`user_{userId}`) and conversation rooms (`chat_{conversationId}`).
- **Reason:** Enables targeted real-time message delivery and instant notification broadcasting without client-side polling.
- **Affected Modules:** Module 1 (Student Portfolio & Real-time Chat), Module 4 (Applications), Module 5 (Verification).
