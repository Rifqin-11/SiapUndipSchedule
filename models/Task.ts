import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  id: string;
  userId: string; // Reference to user who owns this task
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  dueDate: string;
  category: string;
  subjectId?: string; // Reference to Subject document
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      index: true, // Add index for better query performance
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      required: true,
      default: "pending",
    },
    dueDate: {
      type: String, // Store as YYYY-MM-DD format
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    subjectId: {
      type: String, // Reference to Subject document
      required: false,
      index: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create compound indexes for common queries
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, priority: 1 });
TaskSchema.index({ userId: 1, dueDate: 1 });
TaskSchema.index({ userId: 1, subjectId: 1 });

export default mongoose.models.Task ||
  mongoose.model<ITask>("Task", TaskSchema);
