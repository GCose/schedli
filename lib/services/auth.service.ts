import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { AppError } from "@/lib/utils/AppError";
import { sendEmail } from "@/lib/services/email.service";
import {
    verificationEmailTemplate,
    passwordResetEmailTemplate,
} from "@/lib/utils/email.templates";
import type {
    RegisterInput,
    LoginInput,
    ForgotPasswordInput,
    ResetPasswordInput,
    VerifyEmailInput,
    JWTPayload,
    AuthResponse,
} from "@/lib/types";

const JWT_SECRET = process.env.JWT_SECRET!;
const SALT_ROUNDS = 10;
const TOKEN_EXPIRY_HOURS = 24;
const RESET_TOKEN_EXPIRY_HOURS = 1;

function generateToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

export async function registerUser(
    input: RegisterInput
): Promise<AuthResponse> {
    await connectDB();

    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
        throw new AppError("An account with this email already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
    const emailVerificationToken = generateToken();
    const emailVerificationExpiry = new Date(
        Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
    );

    const user = await User.create({
        fullName: input.fullName,
        email: input.email,
        password: hashedPassword,
        emailVerificationToken,
        emailVerificationExpiry,
    });

    await sendEmail({
        to: user.email,
        subject: "Verify your Schedli account",
        html: verificationEmailTemplate(user.fullName, emailVerificationToken),
    });

    return {
        user: {
            id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
        },
    };
}

export async function loginUser(
    input: LoginInput
): Promise<{ token: string; user: AuthResponse["user"] }> {
    await connectDB();

    const user = await User.findOne({ email: input.email });
    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
        throw new AppError("Invalid email or password", 401);
    }

    if (!user.isEmailVerified) {
        throw new AppError("Your account is yet to be verified.", 403);
    }

    const payload: JWTPayload = {
        userId: user._id.toString(),
        role: user.role,
    };

    const expiresIn = input.rememberMe ? "30d" : "7d";
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn });

    return {
        token,
        user: {
            id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
        },
    };
}

export async function forgotPassword(
    input: ForgotPasswordInput
): Promise<void> {
    await connectDB();

    const user = await User.findOne({ email: input.email });
    if (!user) return;

    const passwordResetToken = generateToken();
    const passwordResetExpiry = new Date(
        Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
    );

    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpiry = passwordResetExpiry;
    await user.save();

    await sendEmail({
        to: user.email,
        subject: "Reset your Schedli password",
        html: passwordResetEmailTemplate(user.fullName, passwordResetToken),
    });
}

export async function resetPassword(
    input: ResetPasswordInput
): Promise<void> {
    await connectDB();

    const user = await User.findOne({
        passwordResetToken: input.token,
        passwordResetExpiry: { $gt: new Date() },
    });

    if (!user) {
        throw new AppError("Invalid or expired reset link", 400);
    }

    user.password = await bcrypt.hash(input.password, SALT_ROUNDS);
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();
}

export async function verifyEmail(input: VerifyEmailInput): Promise<void> {
    await connectDB();

    const user = await User.findOne({
        emailVerificationToken: input.token,
        emailVerificationExpiry: { $gt: new Date() },
    });

    if (!user) {
        throw new AppError("Invalid or expired verification link", 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();
}

export async function resendVerificationEmail(email: string): Promise<void> {
    await connectDB();

    const user = await User.findOne({ email });
    if (!user) return;

    if (user.isEmailVerified) {
        throw new AppError("This account is already verified", 400);
    }

    const emailVerificationToken = generateToken();
    const emailVerificationExpiry = new Date(
        Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
    );

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpiry = emailVerificationExpiry;
    await user.save();

    await sendEmail({
        to: user.email,
        subject: "Verify your Schedli account",
        html: verificationEmailTemplate(user.fullName, emailVerificationToken),
    });
}