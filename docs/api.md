# Schedli — API Reference

## Overview

Base URL: `http://localhost:3000` (development), `https://schedli.vercel.app` (production)

All requests must include `Content-Type: application/json`.

Protected routes are authenticated via the `schedli_sid` httpOnly cookie, which is sent automatically by the browser on every request.

## Response Structure

Every response follows a consistent envelope.

**Success:**

```json
{
  "status": "success",
  "data": {}
}
```

**Error:**

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

## Error Types

| Type                   | Description                           |
| ---------------------- | ------------------------------------- |
| `authentication_error` | Authentication or account state issue |
| `authorization_error`  | Insufficient permissions              |
| `validation_error`     | Request body failed validation        |
| `not_found_error`      | Requested resource does not exist     |
| `conflict_error`       | Request conflicts with existing data  |
| `server_error`         | Unexpected server-side failure        |

## Token Strategy

Authentication uses two tokens, both stored as httpOnly cookies — never exposed to client-side JavaScript:

- **Access token** — short-lived (15 minutes), stored in an `httpOnly` cookie named `schedli_sid`, signed with `JWT_ACCESS_SECRET`, sent automatically by the browser on every request to the same domain
- **Refresh token** — long-lived (30 days), stored in an `httpOnly` cookie named `schedli_rt`, signed with `JWT_REFRESH_SECRET`, used only to obtain a new access token when it expires

When the access token expires, the Axios interceptor in `utils/api.ts` silently calls `POST /api/auth/refresh`. The server reads the `schedli_rt` cookie, validates it, invalidates the old one, and issues a new access token and refresh token (rotation). If the refresh token is also expired or invalid, the user is redirected to `/auth/sign-in`.

---

## Authentication

### Register

`POST /api/auth/register`

**Request:**

```json
{
  "fullName": "John Doe",
  "email": "johndoe@example.com",
  "password": "Password@123"
}
```

**Success — 201:**

```json
{
  "status": "success",
  "data": {
    "message": "Registration successful. Check your email to verify your account."
  }
}
```

**Errors:**

| Status | Code                        | Message                                                |
| ------ | --------------------------- | ------------------------------------------------------ |
| 400    | `VALIDATION_ERROR`          | "Full name must be at least 2 characters"              |
| 400    | `VALIDATION_ERROR`          | "Full name must be at most 100 characters"             |
| 400    | `VALIDATION_ERROR`          | "Invalid email address"                                |
| 400    | `VALIDATION_ERROR`          | "Email must be at most 254 characters"                 |
| 400    | `VALIDATION_ERROR`          | "Password must be at least 8 characters"               |
| 400    | `VALIDATION_ERROR`          | "Password must be at most 72 characters"               |
| 400    | `VALIDATION_ERROR`          | "Password must contain at least one uppercase letter"  |
| 400    | `VALIDATION_ERROR`          | "Password must contain at least one lowercase letter"  |
| 400    | `VALIDATION_ERROR`          | "Password must contain at least one number"            |
| 400    | `VALIDATION_ERROR`          | "Password must contain at least one special character" |
| 409    | `AUTH_EMAIL_ALREADY_EXISTS` | "An account with this email already exists"            |
| 500    | `INTERNAL_SERVER_ERROR`     | "Something went wrong"                                 |

---

### Login

`POST /api/auth/login`

**Request:**

```json
{
  "email": "johndoe@example.com",
  "password": "Password@123",
  "rememberMe": true
}
```

**Success — 200:**

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "fullName": "John Doe",
      "email": "johndoe@example.com",
      "role": "personal",
      "isEmailVerified": true
    }
  }
}
```

Both the `schedli_sid` and `schedli_rt` are set as `httpOnly` cookies. When `rememberMe` is false, both cookies are session cookies with no `maxAge` — they expire when the browser closes. When `rememberMe` is true, `schedli_sid` gets a 15-minute `maxAge` and `schedli_rt` gets a 30-day `maxAge`.

**Errors:**

| Status | Code                       | Message                               |
| ------ | -------------------------- | ------------------------------------- |
| 400    | `VALIDATION_ERROR`         | "Invalid email address"               |
| 400    | `VALIDATION_ERROR`         | "Password is required"                |
| 401    | `AUTH_INVALID_CREDENTIALS` | "Invalid credentials"                 |
| 403    | `AUTH_EMAIL_NOT_VERIFIED`  | "Your account is yet to be verified." |
| 500    | `INTERNAL_SERVER_ERROR`    | "Something went wrong"                |

---

### Logout

`POST /api/auth/logout`

No request body required. The `schedli_sid` cookie is read automatically.

**Success — 200:**

```json
{
  "status": "success",
  "data": {
    "message": "Logged out successfully"
  }
}
```

The refresh token is cleared from the database and both the `schedli_sid` and `schedli_rt` cookies are invalidated.

**Errors:**

| Status | Code                    | Message                                 |
| ------ | ----------------------- | --------------------------------------- |
| 401    | `AUTH_UNAUTHORIZED`     | "Authorization token is missing."       |
| 401    | `AUTH_EXPIRED_TOKEN`    | "Session expired. Please log in again." |
| 401    | `AUTH_INVALID_TOKEN`    | "Invalid token."                        |
| 500    | `INTERNAL_SERVER_ERROR` | "Something went wrong"                  |

---

### Refresh Access Token

`POST /api/auth/refresh`

No request body required. The `schedli_rt` cookie is read automatically.

**Success — 200:**

```json
{
  "status": "success"
}
```

A new `schedli_sid` and `schedli_rt` are issued and set as `httpOnly` cookies, replacing the old ones (rotation). Neither token is returned in the response body.

**Errors:**

| Status | Code                    | Message                             |
| ------ | ----------------------- | ----------------------------------- |
| 401    | `AUTH_UNAUTHORIZED`     | "Refresh token is missing."         |
| 401    | `AUTH_EXPIRED_TOKEN`    | "Invalid or expired refresh token." |
| 500    | `INTERNAL_SERVER_ERROR` | "Something went wrong"              |

---

### Verify Email

`POST /api/auth/verify-email`

**Request:**

```json
{
  "token": "a3f1c2e4b5d6a7f8e9c0b1d2a3e4f5c6d7b8a9e0f1c2d3b4a5e6f7c8d9b0a1e2"
}
```

**Success — 200:**

```json
{
  "status": "success",
  "data": {
    "message": "Email verified successfully"
  }
}
```

**Errors:**

| Status | Code                    | Message                                |
| ------ | ----------------------- | -------------------------------------- |
| 400    | `VALIDATION_ERROR`      | "Verification token is required"       |
| 400    | `AUTH_EXPIRED_TOKEN`    | "Invalid or expired verification link" |
| 500    | `INTERNAL_SERVER_ERROR` | "Something went wrong"                 |

---

### Forgot Password

`POST /api/auth/forgot-password`

**Request:**

```json
{
  "email": "johndoe@example.com"
}
```

**Success — 200:**

```json
{
  "status": "success",
  "data": {
    "message": "If an account with that email exists, a reset link has been sent."
  }
}
```

The response is identical whether or not the email exists. This prevents user enumeration.

**Errors:**

| Status | Code                    | Message                 |
| ------ | ----------------------- | ----------------------- |
| 400    | `VALIDATION_ERROR`      | "Invalid email address" |
| 500    | `INTERNAL_SERVER_ERROR` | "Something went wrong"  |

---

### Reset Password

`POST /api/auth/reset-password`

**Request:**

```json
{
  "token": "a3f1c2e4b5d6a7f8e9c0b1d2a3e4f5c6d7b8a9e0f1c2d3b4a5e6f7c8d9b0a1e2",
  "password": "NewPassword@123"
}
```

**Success — 200:**

```json
{
  "status": "success",
  "data": {
    "message": "Password reset successfully"
  }
}
```

On success, the user's password is updated, all active sessions are invalidated by clearing the refresh token from the database, and the reset token is cleared.

**Errors:**

| Status | Code                    | Message                                                |
| ------ | ----------------------- | ------------------------------------------------------ |
| 400    | `VALIDATION_ERROR`      | "Reset token is required"                              |
| 400    | `VALIDATION_ERROR`      | "Password must be at least 8 characters"               |
| 400    | `VALIDATION_ERROR`      | "Password must be at most 72 characters"               |
| 400    | `VALIDATION_ERROR`      | "Password must contain at least one uppercase letter"  |
| 400    | `VALIDATION_ERROR`      | "Password must contain at least one lowercase letter"  |
| 400    | `VALIDATION_ERROR`      | "Password must contain at least one number"            |
| 400    | `VALIDATION_ERROR`      | "Password must contain at least one special character" |
| 400    | `AUTH_EXPIRED_TOKEN`    | "Invalid or expired reset link"                        |
| 500    | `INTERNAL_SERVER_ERROR` | "Something went wrong"                                 |

---

### Resend Verification Email

`POST /api/auth/resend-verification`

**Request:**

```json
{
  "email": "johndoe@example.com"
}
```

**Success — 200:**

```json
{
  "status": "success",
  "data": {
    "message": "If your email is registered and unverified, a new verification link has been sent."
  }
}
```

The response is identical whether or not the email exists. This prevents user enumeration.

**Errors:**

| Status | Code                    | Message                 |
| ------ | ----------------------- | ----------------------- |
| 400    | `VALIDATION_ERROR`      | "Invalid email address" |
| 500    | `INTERNAL_SERVER_ERROR` | "Something went wrong"  |
