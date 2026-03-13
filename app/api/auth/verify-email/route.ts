import { z } from "zod";
import { connectDB } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { NextRequest, NextResponse } from "next/server";
import { verifyEmail } from "@/lib/services/auth.service";
import { ErrorType, ErrorCode } from "@/lib/utils/errorCodes";

const schema = z.object({
    token: z.string().min(1, "Verification token is required"),
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { token } = schema.parse(await req.json());
        await verifyEmail({ token });

        return NextResponse.json({
            status: "success",
            data: { message: "Email verified successfully" },
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