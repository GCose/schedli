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
│   ├── (auth)/                  # Auth pages (sign-in, sign-up, etc.)
│   ├── (dashboard)/             # Dashboard pages (protected)
│   ├── api/
│   │   └── auth/                # Auth route handlers
│   ├── globals.css
│   └── layout.tsx
│
├── lib/
│   ├── db.ts                    # MongoDB connection
│   ├── middleware/
│   │   └── auth.middleware.ts   # JWT verification utilities
│   ├── models/
│   │   └── User.ts              # Mongoose user schema
│   ├── services/
│   │   ├── auth.service.ts      # Auth business logic
│   │   └── email.service.ts     # Email sending logic
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── email.types.ts
│   │   └── index.ts             # Re-exports all types
│   └── utils/
│       ├── AppError.ts          # Custom error class
│       └── email.templates.ts   # HTML email templates
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

`auth.service.ts` handles: user registration, login, email verification, password reset, and resend verification.

`email.service.ts` handles: sending transactional emails via the Resend API.

### Models (`lib/models/`)

Mongoose schemas with field definitions, types, and validation constraints. No business logic lives here.

### Middleware (`lib/middleware/`)

`auth.middleware.ts` exposes two utilities: `verifyToken(token)` decodes and validates a JWT, and `getTokenFromCookie(cookieHeader)` extracts the token string from the `Authorization` cookie header. These will be called at the start of route handlers for protected routes.

---

## Authentication

Authentication uses manual JWT — no NextAuth. This keeps the auth flow transparent and makes the service layer portable.

**Registration flow:**

1. Password is hashed with bcrypt before storage
2. A verification token is generated and stored on the user document with a 24-hour expiry
3. A verification email is sent via Resend
4. The account cannot be used until the email is verified

**Login flow:**

1. Email and password are checked against the database
2. Unverified accounts are rejected with a 403
3. A JWT is signed and returned as an `httpOnly` cookie
4. Cookie max age is 30 days if `rememberMe` is true, 7 days otherwise

**Password reset flow:**

1. A reset token is generated and stored on the user document with a 1-hour expiry
2. A reset link is emailed to the user
3. On submission, the token is validated, the password is updated, and the token is cleared

**Token storage:**
JWTs are stored in `httpOnly` cookies. They are not accessible to JavaScript, which prevents XSS-based token theft.

---

## Error Handling

`AppError` is a custom class extending `Error` with a `statusCode` property. Service functions throw `AppError` for expected failures (wrong password, duplicate email, expired token, etc.).

Route handlers catch three error types:

- `ZodError` — returns the first validation issue message with a 400
- `AppError` — returns the error message with the specified status code
- Anything else — returns a generic 500

---

## Database Connection

`lib/db.ts` caches the Mongoose connection on the Node.js global object. This prevents creating a new connection on every request during development, where Next.js hot-reloads invalidate module-level variables.

---

## Environment Variables

| Variable         | Purpose                             |
| ---------------- | ----------------------------------- |
| `MONGODB_URI`    | MongoDB Atlas connection string     |
| `JWT_SECRET`     | Secret used to sign and verify JWTs |
| `RESEND_API_KEY` | Resend API key for sending email    |
| `APP_URL`        | Base URL used in email links        |
