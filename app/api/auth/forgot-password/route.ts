import { z } from "zod";
import { connectDB } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { NextRequest, NextResponse } from "next/server";
import { forgotPassword } from "@/lib/services/auth.service";

const schema = z.object({
    email: z.email("Invalid email address"),
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = schema.parse(await req.json());
        await forgotPassword(body);
        return NextResponse.json({ message: "If an account with that email exists, a reset link has been sent." }, { status: 200 });
    } catch (err) {
        if (err instanceof z.ZodError) return NextResponse.json({ message: err.issues[0].message }, { status: 400 });
        if (err instanceof AppError) return NextResponse.json({ message: err.message }, { status: err.statusCode });
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    }
}