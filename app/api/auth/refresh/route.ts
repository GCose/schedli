import { connectDB } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { NextRequest, NextResponse } from "next/server";
import { ErrorType, ErrorCode } from "@/lib/utils/errorCodes";
import { refreshAccessToken } from "@/lib/services/auth.service";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get("refreshToken")?.value;

        if (!token) {
            throw new AppError(
                "Refresh token is missing.",
                401,
                ErrorType.AUTHENTICATION,
                ErrorCode.AUTH_UNAUTHORIZED
            );
        }

        const { accessToken, refreshToken } = await refreshAccessToken(token);

        const response = NextResponse.json({
            status: "success",
            data: { accessToken },
        }, { status: 200 });

        response.cookies.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
        });

        return response;
    } catch (err) {
        if (err instanceof AppError) return NextResponse.json({
            status: "error", error: {
                type: err.type,
                code: err.code,
                message: err.message
            }
        }, { status: err.statusCode });

        return NextResponse.json({
            status: "error",
            error: {
                type: ErrorType.SERVER,
                code: ErrorCode.INTERNAL_SERVER_ERROR,
                message: "Something went wrong"
            }
        }, { status: 500 });
    }
}