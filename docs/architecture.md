# Schedli — Architecture

## Overview

Schedli is a Next.js monolith using the App Router. There is no separate backend server. The frontend and API live in the same codebase and deploy together on Vercel.

The core architectural principle is framework isolation. Business logic lives in `lib/` with no dependency on Next.js internals. Route handlers in `app/api/` are thin wrappers — they validate input, call a service function, and return a response. This means the entire service layer can be moved to an Express.js server in the future by writing new controllers that call the same functions.

---

## Tech Stack

| Layer            | Technology                           |
| ---------------- | ------------------------------------ |
| Framework        | Next.js 16 (App Router)              |
| Language         | TypeScript                           |
| Styling          | TailwindCSS v4                       |
| Database         | MongoDB via Mongoose                 |
| Authentication   | Manual JWT (bcryptjs + jsonwebtoken) |
| Input Validation | Zod v4                               |
| Email            | Resend                               |
| Deployment       | Vercel                               |

---

## Folder Structure

```
schedli/
├── app/
│   ├── auth/
│   │   ├── sign-up/
│   │   │   ├── page.tsx
│   │   │   └── SignUpClient.tsx
│   │   ├── sign-in/
│   │   │   ├── page.tsx
│   │   │   └── SignInClient.tsx
│   │   ├── verify-email/
│   │   │   ├── page.tsx
│   │   │   └── VerifyEmailClient.tsx
│   │   ├── resend-verification/
│   │   │   ├── page.tsx
│   │   │   └── ResendVerificationClient.tsx
│   │   ├── forgot-password/
│   │   │   ├── page.tsx
│   │   │   └── ForgotPasswordClient.tsx
│   │   ├── reset-password/
│   │   │   ├── page.tsx
│   │   │   └── ResetPasswordClient.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx                        # Redirects to /auth/sign-in
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── DashboardClient.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   └── auth/
│   │       ├── register/route.ts
│   │       ├── login/route.ts
│   │       ├── logout/route.ts
│   │       ├── refresh/route.ts
│   │       ├── verify-email/route.ts
│   │       ├── resend-verification/route.ts
│   │       ├── forgot-password/route.ts
│   │       └── reset-password/route.ts
│   ├── globals.css
│   ├── icon.png
│   └── layout.tsx
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Checkbox.tsx
│   └── features/
│       └── auth/
│           └── AuthShell.tsx
│
├── lib/
│   ├── db.ts                               # MongoDB connection
│   ├── middleware/
│   │   └── auth.middleware.ts              # JWT verification utilities
│   ├── models/
│   │   └── User.ts                         # Mongoose user schema
│   ├── services/
│   │   ├── auth.service.ts                 # Auth business logic
│   │   └── email.service.ts                # Email sending logic
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── email.types.ts
│   │   ├── organization.types.ts
│   │   └── index.ts                        # Re-exports all lib types
│   └── utils/
│       ├── AppError.ts                     # Custom error class
│       ├── errorCodes.ts                   # Error type and code constants
│       ├── email.templates.ts              # HTML email templates
│       └── validation.ts                   # Shared Zod validation schemas
│
├── types/
│   ├── ui.types.ts                         # UI component prop types
│   ├── auth.types.ts                       # Frontend auth types
│   ├── error.types.ts                      # Frontend error interfaces
│   └── index.ts                            # Re-exports all frontend types
│
├── utils/
│   ├── api.ts                              # Configured Axios instance with refresh interceptor
│   └── error.ts                            # getErrorMessage utility
│
├── docs/
│   ├── api.md
│   ├── architecture.md
│   └── database.md
│
└── proxy.ts                                # Route protection (Next.js 16 Proxy)
```

---

## Request Lifecycle

A request to any API route follows this path:

```
HTTP Request
    → Route Handler (app/api/)
        → Zod schema validation
        → Service function (lib/services/)
            → connectDB()
            → Mongoose model (lib/models/)
            → MongoDB
        → NextResponse
```

The route handler never contains business logic. It handles two things: validating the request body and calling the appropriate service function. The database connection is established inside the service layer.

---

## Layer Responsibilities

### Route Handlers (`app/api/`)

Equivalent to controllers in an MVC pattern. Each handler:

- Parses and validates the request body with Zod
- Calls one service function
- Returns a `NextResponse` with the appropriate status code
- Catches and formats errors (`ZodError`, `AppError`, generic 500)

### Service Layer (`lib/services/`)

Contains all business logic. No Next.js imports. Functions receive plain objects and return plain objects or throw `AppError`.

`auth.service.ts` handles: user registration, login, token refresh, logout, email verification, password reset, and resend verification.

`email.service.ts` handles: sending transactional emails via the Resend API.

### Models (`lib/models/`)

Mongoose schemas with field definitions, types, and validation constraints. No business logic lives here.

### Middleware (`lib/middleware/`)

`auth.middleware.ts` exposes two utilities:

- `verifyAccessToken(token)` — decodes and validates a JWT access token using `JWT_ACCESS_SECRET`, throws `AppError` if expired or invalid
- `extractCookieToken(req)` — reads the `schedli_sid` httpOnly cookie from the request, throws `AppError` if missing

These are called at the start of route handlers for all protected routes.

### Proxy (`proxy.ts`)

Next.js 16 Proxy runs at the edge on every navigation and page refresh. It reads `schedli_sid`, verifies it with `jose`, and enforces two rules:

- Unauthenticated requests to protected routes are redirected to `/auth/sign-in`
- Authenticated requests to auth routes are redirected to `/dashboard`

---

## Authentication

Authentication uses manual JWT with an access token and refresh token pattern — no NextAuth. This keeps the auth flow transparent and makes the service layer portable.

**Registration flow:**

1. Password is hashed with bcrypt before storage
2. A verification token is generated, hashed with SHA-256, and the hash is stored on the user document with a 24-hour expiry
3. The raw token is sent in the verification email link
4. The account cannot be used until the email is verified

**Login flow:**

1. Email and password are checked against the database
2. Unverified accounts are rejected with a 403
3. A short-lived access token (15 minutes) and a long-lived refresh token (30 days) are signed using separate secrets
4. The refresh token is hashed with SHA-256 and the hash is stored on the user document
5. Both tokens are set as `httpOnly` cookies — the access token is never returned in the response body
6. If `rememberMe` is false, both cookies have no `maxAge` and expire when the browser closes
7. If `rememberMe` is true, `schedli_sid` gets a 15-minute `maxAge` and `schedli_rt` gets a 30-day `maxAge`
8. Only the user object is returned in the response

**Token refresh flow:**

1. The Axios interceptor in `utils/api.ts` catches any 401 response and silently calls `POST /api/auth/refresh`
2. The server reads the `schedli_rt` httpOnly cookie
3. The token is validated against `JWT_REFRESH_SECRET` and matched against the stored value on the user document
4. A new access token and a new refresh token are issued (rotation)
5. Both are set as httpOnly cookies — the old refresh token is invalidated
6. The original failed request is retried automatically
7. If the refresh also fails, the user is redirected to `/auth/sign-in`

**Logout flow:**

1. The access token is read from the `schedli_sid` httpOnly cookie
2. The refresh token is cleared from the user document in the database
3. Both the `schedli_sid` and `schedli_rt` cookies are invalidated

**Password reset flow:**

1. A reset token is generated, hashed with SHA-256, and the hash is stored on the user document with a 1-hour expiry
2. The raw token is sent in the reset email link
3. On submission, the incoming token is hashed and matched against the stored hash, the password is updated, the reset token is cleared, and the refresh token is cleared — invalidating all active sessions

---

## Error Handling

`AppError` is a custom class extending `Error` with `statusCode`, `type`, and `code` properties. Service functions throw `AppError` for expected failures.

Route handlers catch three error types:

- `ZodError` — returns a `validation_error` envelope with the first issue message and a 400
- `AppError` — returns an error envelope with the error's type, code, and message at the specified status code
- Anything else — returns a generic `server_error` envelope with a 500

All error responses follow the same structure:

```json
{
  "status": "error",
  "error": {
    "type": "authentication_error",
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Invalid credentials"
  }
}
```

---

## Database Connection

`lib/db.ts` caches the Mongoose connection on the Node.js global object. This prevents creating a new connection on every request during development, where Next.js hot-reloads invalidate module-level variables.

---

## Environment Variables

| Variable             | Purpose                                       |
| -------------------- | --------------------------------------------- |
| `MONGODB_URI`        | MongoDB Atlas connection string               |
| `JWT_ACCESS_SECRET`  | Secret used to sign and verify access tokens  |
| `JWT_REFRESH_SECRET` | Secret used to sign and verify refresh tokens |
| `RESEND_API_KEY`     | Resend API key for sending email              |
| `RESEND_FROM_EMAIL`  | Sender email address for outgoing emails      |
| `APP_URL`            | Base URL used in email links                  |
