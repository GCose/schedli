import mongoose, { Schema } from "mongoose";
import { IUser } from "@/lib/types";

const UserSchema = new Schema<IUser>(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
        },
        role: {
            type: String,
            enum: ["personal", "enterprise"],
            default: "personal",
        },
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: false,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: {
            type: String,
            required: false,
        },
        emailVerificationExpiry: {
            type: Date,
            required: false,
        },
        passwordResetToken: {
            type: String,
            required: false,
        },
        passwordResetExpiry: {
            type: Date,
            required: false,
        },
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;