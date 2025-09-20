import mongoose, { Schema, Document } from "mongoose";

export interface ISubject extends Document {
  id: string;
  userId: string; // Reference to user who owns this subject
  name: string;
  day: string; // For recurring weekly subjects (legacy support)
  specificDate?: string; // For date-specific subjects (YYYY-MM-DD format)
  room: string;
  startTime: string;
  endTime: string;
  lecturer: string[];
  meeting: number;
  startDate?: string; // Tanggal mulai kuliah (YYYY-MM-DD format)
  meetingDates?: string[]; // Array of 14 meeting dates calculated from startDate
  attendanceDates?: string[];
  reschedules?: {
    subjectId: string;
    originalDate: string;
    newDate: string;
    reason: string;
    startTime?: string;
    endTime?: string;
    room?: string;
    createdAt: Date;
  }[];
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    id: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: true, // Add index for better query performance
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    day: {
      type: String,
      required: false,
      trim: true,
    },
    specificDate: {
      type: String, // Store as YYYY-MM-DD format
      required: false,
      trim: true,
    },
    room: {
      type: String,
      required: false,
      trim: true,
    },
    startTime: {
      type: String,
      required: false,
      trim: true,
    },
    endTime: {
      type: String,
      required: false,
      trim: true,
    },
    lecturer: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    meeting: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 14,
    },
    startDate: {
      type: String, // Store as YYYY-MM-DD format
      required: false,
      trim: true,
    },
    meetingDates: [
      {
        type: String, // Store as YYYY-MM-DD format for each of 14 meetings
      },
    ],
    attendanceDates: [
      {
        type: String, // Store as ISO date strings
      },
    ],
    reschedules: [
      {
        subjectId: {
          type: String,
          required: true,
        },
        originalDate: {
          type: String,
          required: true,
        },
        newDate: {
          type: String,
          required: true,
        },
        reason: {
          type: String,
          required: true,
          trim: true,
        },
        startTime: {
          type: String,
          trim: true,
        },
        endTime: {
          type: String,
          trim: true,
        },
        room: {
          type: String,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    category: {
      type: String,
      enum: ["High", "Medium", "Low"],
      required: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create compound index for userId and other commonly queried fields
SubjectSchema.index({ userId: 1, day: 1 });
SubjectSchema.index({ userId: 1, specificDate: 1 });
SubjectSchema.index({ userId: 1, name: 1 });

export default mongoose.models.Subject ||
  mongoose.model<ISubject>("Subject", SubjectSchema);
