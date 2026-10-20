# InternBridge 🚀

**Bridging University Students and Internship Opportunities**

*A Full-Stack Web Application for SWT22022 Practical for Internet Application Development*  
**South Eastern University of Sri Lanka — Group Q**

---

## 👥 Development Team & Module Ownership

| Member | Registration Number | Assigned Module |
| :--- | :--- | :--- |
| **S.A.I.C. Kumara** | `SEU/IS/22/ICT/032` | **Module 1 & 6:** Student Profile & Portfolio Management / Communication & Notifications |
| **S.H.T.K. Hewawasam** | `SEU/IS/22/ICT/033` | **Module 2:** Company & Internship Management |
| **W.M.E. Saumya** | `SEU/IS/22/ICT/035` | **Module 3:** Search & Algorithmic Matching System |
| **G.D.V. Bandara** | `SEU/IS/22/ICT/030` | **Module 4:** Application & Recruitment Management |
| **M.G.K.S. Weerasinghe** | `SEU/IS/22/ICT/057` | **Module 5:** Verification & Rating System |

---

## 🛠️ Technology Stack

- **Frontend:** React.js, Vite, Tailwind CSS, Axios, Lucide Icons, Socket.IO Client
- **Backend:** Node.js, Express.js, Socket.IO, JWT, bcrypt
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Object Storage:** Supabase Storage (Free Tier)
- **Hosting Targets:** Vercel (Frontend), Render (Backend)

---

## 📁 Repository Structure

```
internbridge/
├── client/                     # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── app/                # App configuration, routes, auth context
│   │   ├── components/         # Reusable shared UI primitives
│   │   ├── features/           # Team member feature modules
│   │   │   ├── student-portfolio/
│   │   │   ├── company-internships/
│   │   │   ├── search-matching/
│   │   │   ├── applications/
│   │   │   └── verification-rating/
│   │   ├── services/           # Shared Axios API client
│   │   ├── hooks/              # Shared hooks (useAuth, useSocket)
│   │   ├── types/
│   │   └── lib/
├── server/                     # Backend API & Real-time Server (Node + Express)
│   ├── src/
│   │   ├── config/             # DB, Supabase, and Server configs
│   │   ├── middleware/         # Auth, RBAC, error handlers
│   │   ├── models/             # Shared Mongoose collection schemas
│   │   ├── modules/            # Member backend feature modules
│   │   ├── routes/             # Central route aggregator
│   │   ├── services/           # Shared storage & email services
│   │   ├── utils/              # API response helpers
│   │   └── socket/             # Socket.IO handlers
├── docs/                       # Official System Documentation
│   ├── ARCHITECTURE.md         # System design and integration
│   ├── DATABASE_SCHEMA.md      # Official Mongoose schema models
│   ├── API_CONTRACTS.md        # REST API endpoints & payloads
│   ├── SHARED_COMPONENTS.md    # Common UI & utilities guide
│   └── DECISIONS.md            # Architecture Decision Records (ADRs)
├── prompts/                    # AI Agent Guidelines & Task Templates
├── AGENTS.md                   # Primary instructions for AI agents
├── .gitignore
└── README.md
```

---

## 🚦 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas database connection URI
- Supabase account & storage bucket

### 2. Setup Server
```bash
cd server
npm install
cp .env.example .env   # configure your environment variables
npm run dev
```

### 3. Setup Client
```bash
cd client
npm install
cp .env.example .env   # configure your API URL
npm run dev
```

---

## 📜 Development Guidelines
Before writing code or opening a PR, all team members and AI coding agents must read:
- [`AGENTS.md`](./AGENTS.md)
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- [`docs/DATABASE_SCHEMA.md`](./docs/DATABASE_SCHEMA.md)
- [`docs/API_CONTRACTS.md`](./docs/API_CONTRACTS.md)
