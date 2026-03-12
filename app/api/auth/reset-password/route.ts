import { z } from "zod";
import { connectDB } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { NextRequest, NextResponse } from "next/server";
import { resetPassword } from "@/lib/services/auth.service";
import { ErrorType, ErrorCode } from "@/lib/utils/errorCodes";

const schema = z.object({
    token: z.string().min(1, "Reset token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = schema.parse(await req.json());
        await resetPassword(body);

        return NextResponse.json({
            status: "success",
            data: { message: "Password reset successfully" },
        }, { status: 200 });
    } catch (err) {
        if (err instanceof z.ZodError) return NextResponse.json({
            status: "error",
            error: {
                type: ErrorType.VALIDATION,
                code: ErrorCode.VALIDATION_ERROR,
                message: err.issues[0].message
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