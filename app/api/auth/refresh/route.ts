import { connectDB } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { NextRequest, NextResponse } from "next/server";
import { ErrorType, ErrorCode } from "@/lib/utils/errorCodes";
import { refreshAccessToken } from "@/lib/services/auth.service";

const isProduction = process.env.NODE_ENV === "production";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = req.cookies.get("refresh_token")?.value;

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
        }, { status: 200 });

        response.cookies.set("access_token", accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "strict",
            maxAge: 60 * 15,
            path: "/",
        });

        response.cookies.set("refresh_token", refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "strict",
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