import mongoose, { Document } from "mongoose";

export type ScheduleCategory = "academic" | "study" | "personal" | "work" | "custom";
export type InstitutionType = "university" | "high_school" | "middle_school" | "primary_school";
export type StructureType = "semester" | "trimester";
export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface ISession {
    day: DayOfWeek;
    startTime: string;
    endTime: string;
}

export interface ISchedule extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    category: ScheduleCategory;
    color: string;
    showOnHome: boolean;
    isActive: boolean;
    isDeleted: boolean;
    institutionType?: InstitutionType;
    structureType?: StructureType;
    periodName?: string;
    academicYear?: string;
    expectedNumberOfEntries?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IEntry extends Document {
    userId: mongoose.Types.ObjectId;
    scheduleId: mongoose.Types.ObjectId;
    name: string;
    sessions: ISession[];
    instructorName?: string;
    location?: string;
    courseCode?: string;
    position?: number;
    showOnHome: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}