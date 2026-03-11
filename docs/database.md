# Schedli — Database

## Overview

Schedli uses MongoDB as its database, accessed through Mongoose for schema definition and data validation. The database is hosted on MongoDB Atlas.

Schemas are defined in `lib/models/`. All collections use Mongoose's `timestamps` option, which automatically maintains `createdAt` and `updatedAt` fields on every document.

---

## Collections

### Users

Stores all registered user accounts.

**Collection name:** `users`
**Model file:** `lib/models/User.ts`

| Field                     | Type     | Required | Description                                                                 |
| ------------------------- | -------- | -------- | --------------------------------------------------------------------------- |
| `fullName`                | String   | Yes      | User's full name                                                            |
| `email`                   | String   | Yes      | User's email address. Unique across all accounts                            |
| `password`                | String   | Yes      | bcrypt-hashed password. Plain text is never stored                          |
| `role`                    | String   | Yes      | Account type. Either `personal` or `enterprise`. Defaults to `personal`     |
| `organizationId`          | ObjectId | No       | Reference to the user's organization. Populated when role is `enterprise`   |
| `isEmailVerified`         | Boolean  | Yes      | Whether the user has verified their email address. Defaults to `false`      |
| `emailVerificationToken`  | String   | No       | Token sent in the verification email. Cleared after successful verification |
| `emailVerificationExpiry` | Date     | No       | Expiry time for the verification token. Token is invalid after this point   |
| `passwordResetToken`      | String   | No       | Token sent in the password reset email. Cleared after successful reset      |
| `passwordResetExpiry`     | Date     | No       | Expiry time for the password reset token. Token is invalid after this point |
| `createdAt`               | Date     | Auto     | Timestamp of account creation                                               |
| `updatedAt`               | Date     | Auto     | Timestamp of last document update                                           |

**Constraints:**

- `email` has a unique index. Duplicate registration attempts are rejected at the database level
- `role` is restricted to `personal` and `enterprise` via an enum validator

---

## Relationships

No cross-collection relationships exist yet. The `organizationId` field on the User document is reserved for the enterprise upgrade flow and will reference an `organizations` collection when that feature is implemented.

---

## Security

Passwords are hashed using bcrypt before being written to the database. The plain text password never touches the database at any point.

Verification and reset tokens are single-use strings. Once consumed, they are cleared from the document immediately. Expiry fields enforce time limits independent of whether the token has been used.

All data in transit is encrypted via TLS through the MongoDB Atlas connection string.
