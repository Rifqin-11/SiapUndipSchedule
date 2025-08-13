import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  name: string;
  nim: string;
  email: string;
  jurusan: string;
  fakultas: string;
  angkatan: string;
  profileImage?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    _id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nim: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    jurusan: {
      type: String,
      required: true,
      trim: true,
    },
    fakultas: {
      type: String,
      required: true,
      trim: true,
    },
    angkatan: {
      type: String,
      required: true,
      trim: true,
    },
    profileImage: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      select: false, // Don't include in queries by default
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create indexes for better query performance
UserSchema.index({ nim: 1 });
UserSchema.index({ email: 1 });

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
