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
│       └── email.templates.ts              # HTML email templates
│
├── types/
│   ├── ui.types.ts                         # UI component prop types
│   ├── auth.types.ts                       # Frontend auth types
│   ├── error.types.ts                      # Frontend error interfaces
│   └── index.ts                            # Re-exports all frontend types
│
├── utils/
│   ├── api.ts                              # Configured Axios instance
│   └── error.ts                            # getErrorMessage utility
│
└── docs/
    ├── api.md
    ├── architecture.md
    └── database.md
```

---

## Request Lifecycle

A request to any API route follows this path:

```
HTTP Request
    → Route Handler (app/api/)
        → connectDB()
        → Zod schema validation
        → Service function (lib/services/)
            → Mongoose model (lib/models/)
            → MongoDB
        → NextResponse
```

The route handler never contains business logic. It handles three things: connecting to the database, validating the request body, and calling the appropriate service function.

---

## Layer Responsibilities

### Route Handlers (`app/api/`)

Equivalent to controllers in an MVC pattern. Each handler:

- Connects to the database
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

- `verifyAccessToken(token)` — decodes and validates a JWT access token, throws `AppError` if expired or invalid
- `extractCookieToken(req)` — reads the `accessToken` httpOnly cookie from the request, throws `AppError` if missing

These are called at the start of route handlers for all protected routes.

---

## Authentication

Authentication uses manual JWT with an access token and refresh token pattern — no NextAuth. This keeps the auth flow transparent and makes the service layer portable.

**Registration flow:**

1. Password is hashed with bcrypt before storage
2. A verification token is generated and stored on the user document with a 24-hour expiry
3. A verification email is sent via Resend
4. The account cannot be used until the email is verified

**Login flow:**

1. Email and password are checked against the database
2. Unverified accounts are rejected with a 403
3. A short-lived access token (15 minutes) and a long-lived refresh token (30 days) are signed
4. The refresh token is stored on the user document
5. Both tokens are set as `httpOnly` cookies — the access token is never returned in the response body
6. Only the user object is returned in the response

**Token refresh flow:**

1. The client sends a request to `POST /api/auth/refresh` when the access token expires
2. The server reads the refresh token from the `httpOnly` cookie
3. The token is validated and matched against the stored value on the user document
4. A new access token and a new refresh token are issued (rotation)
5. The old refresh token is invalidated

**Logout flow:**

1. The access token is read from the `accessToken` httpOnly cookie
2. The refresh token is cleared from the user document in the database
3. Both the `accessToken` and `refreshToken` cookies are invalidated

**Password reset flow:**

1. A reset token is generated and stored on the user document with a 1-hour expiry
2. A reset link is emailed to the user
3. On submission, the token is validated, the password is updated, and the token is cleared

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

| Variable         | Purpose                                                       |
| ---------------- | ------------------------------------------------------------- |
| `MONGODB_URI`    | MongoDB Atlas connection string                               |
| `JWT_SECRET`     | Secret used to sign and verify both access and refresh tokens |
| `RESEND_API_KEY` | Resend API key for sending email                              |
| `APP_URL`        | Base URL used in email links                                  |
