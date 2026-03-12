import jwt from "jsonwebtoken";
import type { JWTPayload } from "@/lib/types";
import { AppError } from "@/lib/utils/AppError";
import { ErrorType, ErrorCode } from "@/lib/utils/errorCodes";

const JWT_SECRET = process.env.JWT_SECRET!;

export function verifyAccessToken(token: string): JWTPayload {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (err: unknown) {
        const isExpired = err instanceof jwt.TokenExpiredError;
        throw new AppError(
            isExpired ? "Session expired. Please log in again." : "Invalid token.",
            401,
            ErrorType.AUTHENTICATION,
            isExpired ? ErrorCode.AUTH_EXPIRED_TOKEN : ErrorCode.AUTH_INVALID_TOKEN
        );
    }
}

export function extractBearerToken(authorizationHeader: string | null): string {
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        throw new AppError(
            "Authorization token is missing.",
            401,
            ErrorType.AUTHENTICATION,
            ErrorCode.AUTH_UNAUTHORIZED
        );
    }
    return authorizationHeader.replace("Bearer ", "");
}