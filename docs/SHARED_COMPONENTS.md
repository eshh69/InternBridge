# InternBridge — Shared Components & Utilities Specification (`SHARED_COMPONENTS.md`)

This document defines the common, reusable frontend and backend building blocks. Team members must reuse these components and utilities instead of creating duplicated versions.

---

## 1. Frontend Shared UI Components (`client/src/components/ui/`)

All UI elements follow Tailwind CSS classes and clean responsive design.

### 1.1 Button (`Button.jsx`)
- **Props:**
  - `variant`: `'primary'` (default, indigo/blue), `'secondary'` (gray outline), `'danger'` (red), `'success'` (green), `'ghost'`
  - `size`: `'sm'`, `'md'` (default), `'lg'`
  - `isLoading`: Boolean (renders spinner and disables click)
  - `disabled`: Boolean
  - `onClick`: Function
  - `children`: ReactNode

### 1.2 Input (`Input.jsx`)
- **Props:**
  - `label`: String
  - `error`: String (displays red validation message below input)
  - `helperText`: String
  - Standard HTML input attributes (`type`, `value`, `onChange`, `placeholder`, `name`, `required`)

### 1.3 Modal (`Modal.jsx`)
- **Props:**
  - `isOpen`: Boolean
  - `onClose`: Function
  - `title`: String
  - `children`: ReactNode
  - `footer`: ReactNode (actions)

### 1.4 Badge (`Badge.jsx`)
- **Props:**
  - `variant`: `'info'`, `'success'`, `'warning'`, `'danger'`, `'neutral'`
  - `size`: `'sm'`, `'md'`
  - `children`: ReactNode (e.g. "Verified", "Pending", "Remote", "92% Match")

### 1.5 Loading Spinner (`Spinner.jsx`)
- Full page loader or inline component with size options (`sm`, `md`, `lg`).

### 1.6 Empty State (`EmptyState.jsx`)
- **Props:**
  - `title`: String
  - `description`: String
  - `actionText`: String (optional)
  - `onAction`: Function (optional)
  - `icon`: ReactNode (optional)

---

## 2. Frontend Shared Services & Hooks

### 2.1 Central Axios API Client (`client/src/services/apiClient.js`)
- Pre-configured with base URL from `import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'`.
- Request Interceptor: Automatically inspects `localStorage.getItem('token')` and attaches `Authorization: Bearer <token>`.
- Response Interceptor: Catches `401 Unauthorized` responses and dispatches an auth expiration event to `AuthContext`.

### 2.2 Global Auth Context (`client/src/app/AuthContext.jsx`)
- Exposes:
  - `user`: Authenticated user object (`{ id, name, email, role, ... }`)
  - `token`: JWT string
  - `isAuthenticated`: Boolean
  - `isLoading`: Initial token check status
  - `login(email, password)`: Async function
  - `register(userData)`: Async function
  - `logout()`: Clears storage and redirects

### 2.3 Custom Hooks (`client/src/hooks/`)
- `useAuth()`: Accesses `AuthContext`.
- `useSocket()`: Provides access to the singleton Socket.IO client, handles room joins, and cleans up event listeners on unmount.
- `useDebounce(value, delay)`: Debounces search inputs for the Search & Matching engine.

---

## 3. Backend Shared Utilities & Middleware (`server/src/`)

### 3.1 Authentication Middleware (`server/src/middleware/auth.js`)
- `protect`: Verifies JWT from `Authorization: Bearer <token>`. Decodes payload, finds user in MongoDB, and attaches to `req.user`.
- `authorize(...roles)`: RBAC middleware. Checks if `roles.includes(req.user.role)`. If not, returns `403 Forbidden`.

### 3.2 Standard Error Handler (`server/src/middleware/errorHandler.js`)
- Catches Mongoose `ValidationError`, `CastError`, duplicate key `11000`, and JWT errors.
- Always returns standardized JSON error envelopes.

### 3.3 Supabase Storage Service (`server/src/services/storageService.js`)
- `uploadFile(fileBuffer, originalName, mimeType, folder)`: Uploads file to Supabase Storage bucket and returns public URL.
- `deleteFile(fileUrl)`: Deletes file from bucket.

### 3.4 API Response Helper (`server/src/utils/apiResponse.js`)
- `sendSuccess(res, statusCode, message, data)`
- `sendError(res, statusCode, message, errors)`
