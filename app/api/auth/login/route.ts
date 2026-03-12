import { z } from "zod";
import { connectDB } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { ErrorType, ErrorCode } from "@/lib/utils/errorCodes";
import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/services/auth.service";

const schema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = schema.parse(await req.json());
        const { accessToken, user, refreshToken } = await loginUser(body);

        const response = NextResponse.json({
            status: "success",
            data: { accessToken, user },
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
        if (err instanceof z.ZodError) return NextResponse.json({
            status: "error",
            error: {
                type: ErrorType.VALIDATION,
                code: ErrorCode.VALIDATION_ERROR, message: err.issues[0].message
            }
        }, { status: 400 });

        if (err instanceof AppError) return NextResponse.json({
            status: "error",
            error: {
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