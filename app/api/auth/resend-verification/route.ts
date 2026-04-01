import { z } from "zod";
import { AppError } from "@/lib/utils/AppError";
import { emailSchema } from "@/lib/utils/validation";
import { NextRequest, NextResponse } from "next/server";
import { ErrorType, ErrorCode } from "@/lib/utils/errorCodes";
import { resendVerificationEmail } from "@/lib/services/auth.service";

const schema = z.object({
    email: emailSchema,
});

export async function POST(req: NextRequest) {
    try {
        const { email } = schema.parse(await req.json());
        await resendVerificationEmail(email);

        return NextResponse.json({
            status: "success",
            data: { message: "If your email is registered and unverified, a new verification link has been sent." },
        }, { status: 200 });
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