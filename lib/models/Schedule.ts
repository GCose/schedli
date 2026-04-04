import { ISchedule } from "@/lib/types";
import mongoose, { Schema } from "mongoose";

const categoryColors: Record<string, string> = {
    academic: "#2CAC09",
    study: "#EB7E25",
    personal: "#CD25EB",
    work: "#2563EB",
};

const ScheduleSchema = new Schema<ISchedule>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true,
        },
        name: {
            type: String,
            required: [true, "Schedule name is required"],
            trim: true,
            maxlength: [100, "Schedule name must be at most 100 characters"],
        },
        category: {
            type: String,
            enum: ["academic", "study", "personal", "work", "custom"],
            required: [true, "Category is required"],
        },
        color: {
            type: String,
            trim: true,
        },
        showOnHome: {
            type: Boolean,
            default: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        institutionType: {
            type: String,
            enum: ["university", "high_school", "middle_school", "primary_school"],
            required: function (this: ISchedule) {
                return this.category === "academic";
            },
        },
        structureType: {
            type: String,
            enum: ["semester", "trimester"],
            required: function (this: ISchedule) {
                return this.category === "academic" && this.institutionType === "university";
            },
        },
        periodName: {
            type: String,
            trim: true,
            required: function (this: ISchedule) {
                return this.category === "academic";
            },
        },
        academicYear: {
            type: String,
            trim: true,
            required: function (this: ISchedule) {
                return this.category === "academic";
            },
        },
        expectedNumberOfEntries: {
            type: Number,
            min: [1, "Must have at least one entry"],
            required: function (this: ISchedule) {
                return this.category === "academic";
            },
        },
    },
    { timestamps: true }
);

ScheduleSchema.pre("save", async function () {
    if (!this.color) {
        if (this.category === "custom") {
            throw new Error("Custom schedules must provide a unique color");
        }
        this.color = categoryColors[this.category] ?? "#2563EB";
    }
});

const Schedule =
    mongoose.models.Schedule ||
    mongoose.model<ISchedule>("Schedule", ScheduleSchema);

export default Schedule;