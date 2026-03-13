import type {
    LoginInput,
    JWTPayload,
    RegisterInput,
    VerifyEmailInput,
    LoginServiceResult,
    ResetPasswordInput,
    ForgotPasswordInput,
} from "@/lib/types";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
    verificationEmailTemplate,
    passwordResetEmailTemplate,
} from "@/lib/utils/email.templates";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { AppError } from "@/lib/utils/AppError";
import { sendEmail } from "@/lib/services/email.service";
import { ErrorType, ErrorCode } from "@/lib/utils/errorCodes";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const SALT_ROUNDS = 10;
const TOKEN_EXPIRY_HOURS = 24;
const RESET_TOKEN_EXPIRY_HOURS = 1;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "30d";

function generateToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

function signAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function signRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export async function registerUser(input: RegisterInput): Promise<void> {
    await connectDB();

    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
        throw new AppError(
            "An account with this email already exists",
            409,
            ErrorType.AUTHENTICATION,
            ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
        );
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
}

export async function loginUser(input: LoginInput): Promise<LoginServiceResult> {
    await connectDB();

    const user = await User.findOne({ email: input.email });
    if (!user) {
        throw new AppError(
            "Invalid credentials",
            401,
            ErrorType.AUTHENTICATION,
            ErrorCode.AUTH_INVALID_CREDENTIALS
        );
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
        throw new AppError(
            "Invalid credentials",
            401,
            ErrorType.AUTHENTICATION,
            ErrorCode.AUTH_INVALID_CREDENTIALS
        );
    }

    if (!user.isEmailVerified) {
        throw new AppError(
            "Your account is yet to be verified.",
            403,
            ErrorType.AUTHENTICATION,
            ErrorCode.AUTH_EMAIL_NOT_VERIFIED
        );
    }

    const payload: JWTPayload = {
        userId: user._id.toString(),
        role: user.role,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    user.refreshToken = refreshToken;
    await user.save();

    return {
        accessToken,
        refreshToken,
        user: {
            id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
        },
    };
}

export async function refreshAccessToken(
    token: string
): Promise<{ accessToken: string; refreshToken: string }> {
    await connectDB();

    let payload: JWTPayload;
    try {
        payload = jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
    } catch {
        throw new AppError(
            "Invalid or expired refresh token.",
            401,
            ErrorType.AUTHENTICATION,
            ErrorCode.AUTH_EXPIRED_TOKEN
        );
    }

    const user = await User.findOne({
        _id: payload.userId,
        refreshToken: token,
    });

    if (!user) {
        throw new AppError(
            "Invalid or expired refresh token.",
            401,
            ErrorType.AUTHENTICATION,
            ErrorCode.AUTH_EXPIRED_TOKEN
        );
    }

    const newPayload: JWTPayload = {
        userId: user._id.toString(),
        role: user.role,
    };

    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    user.refreshToken = newRefreshToken;
    await user.save();

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
}

export async function logoutUser(userId: string): Promise<void> {
    await connectDB();
    await User.findByIdAndUpdate(userId, { refreshToken: undefined });
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<void> {
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

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
    await connectDB();

    const user = await User.findOne({
        passwordResetToken: input.token,
        passwordResetExpiry: { $gt: new Date() },
    });

    if (!user) {
        throw new AppError(
            "Invalid or expired reset link",
            400,
            ErrorType.AUTHENTICATION,
            ErrorCode.AUTH_EXPIRED_TOKEN
        );
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
        throw new AppError(
            "Invalid or expired verification link",
            400,
            ErrorType.AUTHENTICATION,
            ErrorCode.AUTH_EXPIRED_TOKEN
        );
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
        throw new AppError(
            "This account is already verified",
            400,
            ErrorType.AUTHENTICATION,
            ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
        );
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