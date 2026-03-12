# Schedli — API Reference

## Overview

Base URL: `http://localhost:3000` (development), `https://schedli.vercel.app` (production)

All requests must include `Content-Type: application/json`.

Protected routes require an `Authorization` header:

```
Authorization: Bearer <accessToken>
```

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

Authentication uses two tokens:

- **Access token** — short-lived (15 minutes), returned in the response body, sent as a Bearer token on every protected request
- **Refresh token** — long-lived (30 days), stored in an `httpOnly` cookie named `refreshToken`, used only to obtain a new access token when it expires

When the access token expires, the client calls `POST /api/auth/refresh` silently. The server validates the refresh token, invalidates it, and issues a new access token and a new refresh token (rotation). If the refresh token is also expired or invalid, the user must log in again.

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

| Status | Code                        | Message                                     |
| ------ | --------------------------- | ------------------------------------------- |
| 400    | `VALIDATION_ERROR`          | "Full name must be at least 2 characters"   |
| 400    | `VALIDATION_ERROR`          | "Invalid email address"                     |
| 400    | `VALIDATION_ERROR`          | "Password must be at least 8 characters"    |
| 409    | `AUTH_EMAIL_ALREADY_EXISTS` | "An account with this email already exists" |
| 500    | `INTERNAL_SERVER_ERROR`     | "Something went wrong"                      |

---

### Login

`POST /api/auth/login`

**Request:**

```json
{
  "email": "johndoe@example.com",
  "password": "Password@123"
}
```

**Success — 200:**

```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
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

The refresh token is returned as an `httpOnly` cookie named `refreshToken` with a 30-day max age. The access token expires in 15 minutes.

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

Requires `Authorization: Bearer <accessToken>` header. No request body required.

**Success — 200:**

```json
{
  "status": "success",
  "data": {
    "message": "Logged out successfully"
  }
}
```

The refresh token is cleared from the database and the `refreshToken` cookie is invalidated.

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

No request body required. The `refreshToken` cookie is read automatically.

**Success — 200:**

```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

A new refresh token is issued and set as an `httpOnly` cookie, replacing the old one (rotation).

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

**Errors:**

| Status | Code                    | Message                                  |
| ------ | ----------------------- | ---------------------------------------- |
| 400    | `VALIDATION_ERROR`      | "Reset token is required"                |
| 400    | `VALIDATION_ERROR`      | "Password must be at least 8 characters" |
| 400    | `AUTH_EXPIRED_TOKEN`    | "Invalid or expired reset link"          |
| 500    | `INTERNAL_SERVER_ERROR` | "Something went wrong"                   |

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

| Status | Code                        | Message                            |
| ------ | --------------------------- | ---------------------------------- |
| 400    | `VALIDATION_ERROR`          | "Invalid email address"            |
| 400    | `AUTH_EMAIL_ALREADY_EXISTS` | "This account is already verified" |
| 500    | `INTERNAL_SERVER_ERROR`     | "Something went wrong"             |
