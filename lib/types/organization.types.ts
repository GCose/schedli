import mongoose, { Document } from "mongoose";

export interface IOrganization extends Document {
    name: string;
    slug: string;
    ownerId: mongoose.Types.ObjectId;
    members: {
        userId: mongoose.Types.ObjectId;
        role: "admin" | "member";
        joinedAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}