import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
    fullName: string;
    email: string;
    password: string;
    role: "personal" | "enterprise";
    organizationId?: mongoose.Types.ObjectId;
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationExpiry?: Date;
    passwordResetToken?: string;
    passwordResetExpiry?: Date;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
}