# InternBridge — REST API Contracts (`API_CONTRACTS.md`)

All API routes are served under `/api/v1/`. All request payloads and response bodies are JSON.

---

## 1. Global Standards & Error Codes

### Standard Response Envelope:
```json
// Success Response (HTTP 200, 201)
{
  "success": true,
  "message": "Action completed successfully",
  "data": { ... }
}

// Error Response (HTTP 400, 401, 403, 404, 500)
{
  "success": false,
  "message": "Specific explanation of error",
  "errors": [
    { "field": "email", "message": "Email is already in use" }
  ]
}
```

### HTTP Status Conventions:
- `200 OK`: Successful read or update.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation failure or malformed payload.
- `401 Unauthorized`: Missing or invalid Bearer token.
- `403 Forbidden`: Authenticated user lacks role permission for this resource.
- `404 Not Found`: Target resource does not exist.
- `500 Internal Server Error`: Unhandled server exception.

---

## 2. Authentication & User Management (Shared Foundation)

| Endpoint | Method | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/auth/register` | `POST` | Public | Any | Register user account |
| `/api/v1/auth/login` | `POST` | Public | Any | Authenticate & get JWT token |
| `/api/v1/auth/me` | `GET` | Bearer Token | Any | Get current user session info |
| `/api/v1/auth/update-password` | `PUT` | Bearer Token | Any | Change account password |

#### `POST /api/v1/auth/register`
- **Request Body:**
  ```json
  {
    "name": "Kamal Perera",
    "email": "kamal@example.com",
    "password": "StrongPassword123!",
    "role": "student" // 'student' | 'company' | 'reviewer'
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "data": {
      "user": { "id": "...", "name": "...", "email": "...", "role": "student" },
      "token": "eyJhbGciOi..."
    }
  }
  ```

---

## 3. Module 1: Student Portfolio & Real-time Chat (Member Kumara - 032)

| Endpoint | Method | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/students/me` | `GET` | Bearer Token | `student` | Get current student portfolio |
| `/api/v1/students/me` | `PUT` | Bearer Token | `student` | Update current student portfolio |
| `/api/v1/students/:id` | `GET` | Bearer Token | Any | View public portfolio of a student |
| `/api/v1/students/upload-cv` | `POST` | Bearer Token | `student` | Upload CV to Supabase & save URL |
| `/api/v1/conversations` | `GET` | Bearer Token | `student`, `company` | List active conversations |
| `/api/v1/conversations` | `POST` | Bearer Token | `student`, `company` | Start or get conversation |
| `/api/v1/conversations/:id/messages` | `GET` | Bearer Token | Participant | Get chat history |
| `/api/v1/conversations/:id/messages` | `POST` | Bearer Token | Participant | Send message via REST fallback |
| `/api/v1/notifications` | `GET` | Bearer Token | Any | Get user notifications |
| `/api/v1/notifications/:id/read` | `PATCH` | Bearer Token | Recipient | Mark notification as read |

#### `PUT /api/v1/students/me`
- **Request Body:**
  ```json
  {
    "university": "South Eastern University of Sri Lanka",
    "degree": "BSc in Information and Communication Technology",
    "academicYear": "3rd Year",
    "gpa": 3.65,
    "bio": "Aspiring Full Stack Engineer passionate about React and Node.js",
    "skills": ["react", "node.js", "mongodb", "javascript", "tailwind"],
    "projects": [
      {
        "title": "InternBridge Platform",
        "description": "Full-stack internship portal",
        "technologies": ["React", "Express", "MongoDB"],
        "githubUrl": "https://github.com/..."
      }
    ],
    "links": {
      "github": "https://github.com/kamal",
      "linkedin": "https://linkedin.com/in/kamal"
    }
  }
  ```

---

## 4. Module 2: Company & Internship Management (Member Hewawasam - 033)

| Endpoint | Method | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/companies/me` | `GET` | Bearer Token | `company` | Get company profile |
| `/api/v1/companies/me` | `PUT` | Bearer Token | `company` | Update company profile |
| `/api/v1/companies/:id` | `GET` | Bearer Token | Any | View public company profile |
| `/api/v1/internships` | `POST` | Bearer Token | `company` | Create new internship listing |
| `/api/v1/internships/my` | `GET` | Bearer Token | `company` | Get internships created by company |
| `/api/v1/internships/:id` | `GET` | Public / Token | Any | Get single internship details |
| `/api/v1/internships/:id` | `PUT` | Bearer Token | Owner Company | Edit internship listing |
| `/api/v1/internships/:id/status`| `PATCH`| Bearer Token | Owner Company | Change status (`draft`, `published`, `closed`)|
| `/api/v1/internships/:id` | `DELETE`| Bearer Token | Owner Company | Delete internship listing |

#### `POST /api/v1/internships`
- **Request Body:**
  ```json
  {
    "title": "Full Stack Developer Intern",
    "description": "Join our engineering team to build scalable web apps...",
    "area": "Software Engineering",
    "requiredSkills": ["react", "node.js", "mongodb", "git"],
    "qualifications": ["Undergraduate in IT / CS", "Knowledge of REST APIs"],
    "locationType": "Hybrid",
    "location": "Colombo, Sri Lanka",
    "durationMonths": 6,
    "openPositions": 2,
    "stipend": { "isPaid": true, "amount": 40000, "currency": "LKR" },
    "deadline": "2026-11-30T00:00:00.000Z"
  }
  ```

---

## 5. Module 3: Search & Matching Engine (Member Saumya - 035)

| Endpoint | Method | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/search/internships` | `GET` | Public / Token | Any | Search & filter internships |
| `/api/v1/search/students` | `GET` | Bearer Token | `company` | Search candidates by skills/degree |
| `/api/v1/match/internships` | `GET` | Bearer Token | `student` | Ranked recommended internships with match score |
| `/api/v1/match/internship/:id/candidates` | `GET` | Bearer Token | Owner Company | Ranked candidate list with match score |

#### `GET /api/v1/search/internships`
- **Query Parameters:**
  - `keyword` (text match on title/description)
  - `skills` (comma-separated, e.g. `react,node.js`)
  - `locationType` (`On-site`, `Remote`, `Hybrid`)
  - `area` (e.g. `Software Engineering`)
  - `page` (default: 1), `limit` (default: 10)
- **Response Format:**
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "...",
          "title": "Full Stack Developer Intern",
          "company": { "name": "Virtusa", "logoUrl": "..." },
          "location": "Colombo",
          "locationType": "Hybrid",
          "requiredSkills": ["react", "node.js"],
          "matchScore": 80 // Included if student is logged in
        }
      ],
      "pagination": { "total": 42, "page": 1, "pages": 5 }
    }
  }
  ```

---

## 6. Module 4: Application & Recruitment Management (Member Bandara - 030)

| Endpoint | Method | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/applications` | `POST` | Bearer Token | `student` | Apply for an internship |
| `/api/v1/applications/my` | `GET` | Bearer Token | `student` | Student views submitted applications |
| `/api/v1/applications/internship/:id` | `GET` | Bearer Token | Owner Company | Company views applicants for listing |
| `/api/v1/applications/:id` | `GET` | Bearer Token | Applicant / Company | Get application details |
| `/api/v1/applications/:id/status` | `PATCH` | Bearer Token | Owner Company | Update status (`shortlisted`, `rejected`, etc.) |

#### `POST /api/v1/applications`
- **Request Body:**
  ```json
  {
    "internshipId": "651234abcd...",
    "resumeUrl": "https://supabase.../resume.pdf",
    "coverLetter": "I am passionate about this internship opportunity because..."
  }
  ```

#### `PATCH /api/v1/applications/:id/status`
- **Request Body:**
  ```json
  {
    "status": "shortlisted", // 'under_review' | 'shortlisted' | 'rejected' | 'hired'
    "notes": "Strong candidate, scheduled interview for next Tuesday"
  }
  ```

---

## 7. Module 5: Verification & Rating System (Member Weerasinghe - 057)

| Endpoint | Method | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/verifications/request` | `POST` | Bearer Token | `reviewer`, `company` | Submit verification proof |
| `/api/v1/verifications/pending` | `GET` | Bearer Token | `admin` | Admin views pending verification requests |
| `/api/v1/verifications/:id/decision` | `PATCH` | Bearer Token | `admin` | Approve or reject verification |
| `/api/v1/reviews` | `POST` | Bearer Token | `reviewer` | Submit review/rating for student/company |
| `/api/v1/reviews/target/:targetId` | `GET` | Public / Token | Any | Get all verified reviews for an entity |

#### `POST /api/v1/reviews`
- **Request Body:**
  ```json
  {
    "targetType": "student", // 'student' | 'company'
    "targetStudentId": "654321...",
    "ratings": {
      "technicalSkills": 5,
      "softSkills": 4,
      "professionalism": 5
    },
    "overallRating": 4.7,
    "comments": "Consistently demonstrates high technical aptitude and teamwork."
  }
  ```
