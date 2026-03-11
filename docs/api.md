# Schedli API Documentation

**Version:** 1.0  
**Base URL:** `http://localhost:3000` (development) / `https://schedli.vercel.app` (production)  
**Last Updated:** March 2026

All request bodies must be JSON. Set `Content-Type: application/json` on every request.

Authentication uses httpOnly cookies. After a successful login, the server sets a `token` cookie automatically. All subsequent requests from the browser include this cookie — no manual header configuration needed.

---

## Authentication

### Register

Creates a new user account and sends a verification email.

**POST** `/api/auth/register`  
**Access:** Public

**Request**

```json
{
  "fullName": "John Doe",
  "email": "johndoe@example.com",
  "password": "Password@2026"
}
```

**Response** `201`

```json
{
  "message": "Registration successful. Check your email to verify your account."
}
```

**Error Responses**
| Status | Message | Trigger |
|---|---|---|
| 400 | Validation error message | Invalid or missing fields |
| 409 | An account with this email already exists | Email already registered |
| 500 | Something went wrong | Unexpected server error |

---

### Verify Email

Verifies a user's email address using the token sent in the verification email.

**POST** `/api/auth/verify-email`  
**Access:** Public

**Request**

```json
{
  "token": "a3f1c2d4e5b6..."
}
```

**Response** `200`

```json
{
  "message": "Email verified successfully."
}
```

**Error Responses**
| Status | Message | Trigger |
|---|---|---|
| 400 | Verification token is required | Missing token field |
| 400 | Invalid or expired verification link | Token not found or expired (24hr window) |
| 500 | Something went wrong | Unexpected server error |

---

### Resend Verification Email

Sends a new verification email to an unverified account.

**POST** `/api/auth/resend-verification`  
**Access:** Public

**Request**

```json
{
  "email": "johndoe@example.com"
}
```

**Response** `200`

```json
{
  "message": "If your email is registered and unverified, a new verification link has been sent."
}
```

**Error Responses**
| Status | Message | Trigger |
|---|---|---|
| 400 | Invalid email address | Malformed email |
| 400 | This account is already verified | Account already verified |
| 500 | Something went wrong | Unexpected server error |

---

### Login

Authenticates a user and sets an httpOnly cookie containing the JWT.

**POST** `/api/auth/login`  
**Access:** Public

**Request**

```json
{
  "email": "johndoe@example.com",
  "password": "Password@2026",
  "rememberMe": true
}
```

**Response** `200`

```json
{
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "fullName": "John Doe",
    "email": "johndoe@example.com",
    "role": "personal",
    "isEmailVerified": true
  }
}
```

**Cookie Set on Success**
| Property | Value |
|---|---|
| name | token |
| httpOnly | true |
| sameSite | lax |
| secure | true (production only) |
| maxAge | 7 days (30 days if rememberMe is true) |

**Error Responses**
| Status | Message | Trigger |
|---|---|---|
| 400 | Validation error message | Invalid or missing fields |
| 401 | Invalid email or password | Wrong credentials |
| 403 | Your account is yet to be verified. | Email not verified |
| 500 | Something went wrong | Unexpected server error |

---

### Logout

Clears the authentication cookie.

**POST** `/api/auth/logout`  
**Access:** Public  
**Body:** None

**Response** `200`

```json
{
  "message": "Logged out successfully."
}
```

---

### Forgot Password

Sends a password reset link to the provided email address.

**POST** `/api/auth/forgot-password`  
**Access:** Public

**Request**

```json
{
  "email": "johndoe@example.com"
}
```

**Response** `200`

```json
{
  "message": "If an account with that email exists, a reset link has been sent."
}
```

**Error Responses**
| Status | Message | Trigger |
|---|---|---|
| 400 | Invalid email address | Malformed email |
| 500 | Something went wrong | Unexpected server error |

---

### Reset Password

Resets a user's password using the token from the reset email.

**POST** `/api/auth/reset-password`  
**Access:** Public

**Request**

```json
{
  "token": "b7e2d3f4a5c6...",
  "password": "NewPassword@2026"
}
```

**Response** `200`

```json
{
  "message": "Password reset successfully."
}
```

**Error Responses**
| Status | Message | Trigger |
|---|---|---|
| 400 | Validation error message | Invalid or missing fields |
| 400 | Invalid or expired reset link | Token not found or expired (1hr window) |
| 500 | Something went wrong | Unexpected server error |

---

## Security Notes

Forgot password and resend verification endpoints always return 200 regardless of whether the email exists in the system. This is intentional — returning a different response for unknown emails would allow attackers to enumerate registered accounts.

Login error messages are intentionally vague — "Invalid email or password" rather than specifying which field is wrong. This prevents attackers from knowing whether an email is registered.
