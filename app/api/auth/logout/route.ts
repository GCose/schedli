import { connectDB } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { NextRequest, NextResponse } from "next/server";
import { logoutUser } from "@/lib/services/auth.service";
import { ErrorType, ErrorCode } from "@/lib/utils/errorCodes";
import { extractCookieToken, verifyAccessToken } from "@/lib/middleware/auth.middleware";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = extractCookieToken(req);
        const payload = verifyAccessToken(token);
        await logoutUser(payload.userId);

        const response = NextResponse.json({
            status: "success",
            data: { message: "Logged out successfully" },
        }, { status: 200 });

        response.cookies.set("access_token", "", { httpOnly: true, maxAge: 0, path: "/" });
        response.cookies.set("refresh_token", "", { httpOnly: true, maxAge: 0, path: "/" });

        return response;
    } catch (err) {
        if (err instanceof AppError) return NextResponse.json({
            status: "error",
            error: {
                type: err.type,
                code: err.code,
                message: err.message,
            },
        }, { status: err.statusCode });

        return NextResponse.json({
            status: "error",
            error: {
                type: ErrorType.SERVER,
                code: ErrorCode.INTERNAL_SERVER_ERROR,
                message: "Something went wrong",
            },
        }, { status: 500 });
    }
}