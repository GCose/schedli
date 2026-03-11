import { z } from "zod";
import { connectDB } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
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
        const { user, token } = await loginUser(body);

        const response = NextResponse.json({ user }, { status: 200 });
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: body.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7,
            path: "/",
        });

        return response;
    } catch (err) {
        if (err instanceof z.ZodError) return NextResponse.json({ message: err.issues[0].message }, { status: 400 });
        if (err instanceof AppError) return NextResponse.json({ message: err.message }, { status: err.statusCode });
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    }
}