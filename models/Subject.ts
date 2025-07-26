import mongoose, { Document, Schema } from "mongoose";

export interface ISubject extends Document {
  id: string;
  name: string;
  day: string;
  room: string;
  startTime: string;
  endTime: string;
  lecturer: string[];
  meeting: number;
  category?: string;
}

const SubjectSchema: Schema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    day: {
      type: String,
      required: true,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },
    room: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    lecturer: {
      type: [String],
      required: true,
    },
    meeting: {
      type: Number,
      required: true,
      min: 0,
      max: 14,
    },
    category: {
      type: String,
      enum: ["High", "Medium", "Low"],
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Subject ||
  mongoose.model<ISubject>("Subject", SubjectSchema);
