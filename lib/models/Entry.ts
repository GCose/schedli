import { IEntry, ISession } from "@/lib/types";
import mongoose, { Schema } from "mongoose";

const SessionSchema = new Schema(
    {
        day: {
            type: String,
            enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
            required: [true, "Day is required"],
        },
        startTime: {
            type: String,
            required: [true, "Start time is required"],
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be in HH:MM 24hr format"],
        },
        endTime: {
            type: String,
            required: [true, "End time is required"],
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "End time must be in HH:MM 24hr format"],
            validate: {
                validator: function (this: ISession, value: string) {
                    return this.startTime < value;
                },
                message: "Start time must be before end time",
            },
        },
    },
    { _id: false }
);

const EntrySchema = new Schema<IEntry>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        scheduleId: {
            type: Schema.Types.ObjectId,
            ref: "Schedule",
            required: [true, "Schedule ID is required"],
        },
        name: {
            type: String,
            required: [true, "Entry name is required"],
            trim: true,
            maxlength: [150, "Entry name must be at most 150 characters"],
        },
        sessions: {
            type: [SessionSchema],
            required: true,
            validate: {
                validator: (v: unknown[]) => v.length > 0,
                message: "At least one session is required",
            },
        },
        instructorName: {
            type: String,
            trim: true,
            required: false,
        },
        location: {
            type: String,
            trim: true,
            required: false,
        },
        courseCode: {
            type: String,
            trim: true,
            required: false,
        },
        position: {
            type: Number,
            required: false,
        },
        showOnHome: {
            type: Boolean,
            default: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

EntrySchema.index({ userId: 1 });
EntrySchema.index({ userId: 1, scheduleId: 1 });
EntrySchema.index({ scheduleId: 1 });

const Entry =
    mongoose.models.Entry ||
    mongoose.model<IEntry>("Entry", EntrySchema);

export default Entry;