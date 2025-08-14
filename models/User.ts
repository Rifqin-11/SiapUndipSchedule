import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  name: string;
  nim?: string | null;
  email: string;
  jurusan?: string | null;
  fakultas?: string | null;
  angkatan?: string | null;
  profileImage?: string;
  password: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLoginAt?: Date;
  rememberToken?: string;
  rememberTokenExpires?: Date;
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
      required: false,
      unique: true,
      sparse: true, // Allow null/undefined values, but ensure uniqueness when value exists
      trim: true,
      default: null,
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
      required: false,
      trim: true,
      default: null,
    },
    fakultas: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    angkatan: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    profileImage: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't include in queries by default
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    rememberToken: {
      type: String,
      select: false,
    },
    rememberTokenExpires: {
      type: Date,
      select: false,
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
