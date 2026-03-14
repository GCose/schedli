import { z } from "zod";
import { connectDB } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { emailSchema } from "@/lib/utils/validation";
import { loginUser } from "@/lib/services/auth.service";
import { NextRequest, NextResponse } from "next/server";
import { ErrorType, ErrorCode } from "@/lib/utils/errorCodes";

const schema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required").max(72, "Password must be at most 72 characters"),
    rememberMe: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = schema.parse(await req.json());
        const { accessToken, refreshToken, rememberMe, user } = await loginUser(body);

        const response = NextResponse.json({
            status: "success",
            data: { user },
        }, { status: 200 });

        const isProduction = process.env.NODE_ENV === "production";

        response.cookies.set("schedli_sid", accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "strict",
            ...(rememberMe && { maxAge: 60 * 15 }),
            path: "/",
        });

        response.cookies.set("schedli_rt", refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "strict",
            ...(rememberMe && { maxAge: 60 * 60 * 24 * 30 }),
            path: "/",
        });

        return response;
    } catch (err) {
        if (err instanceof z.ZodError) return NextResponse.json({
            status: "error",
            error: {
                type: ErrorType.VALIDATION,
                code: ErrorCode.VALIDATION_ERROR,
                message: err.issues[0].message,
            },
        }, { status: 400 });

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