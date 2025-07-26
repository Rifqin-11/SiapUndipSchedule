import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  nim?: string;
  jurusan?: string;
  fakultas?: string;
  angkatan?: string;
  avatar?: string;
  role: "student" | "admin";
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Nama lengkap wajib diisi"],
      trim: true,
      maxLength: [50, "Nama tidak boleh lebih dari 50 karakter"],
    },
    email: {
      type: String,
      required: [true, "Email wajib diisi"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Format email tidak valid",
      ],
    },
    password: {
      type: String,
      required: [true, "Password wajib diisi"],
      minLength: [6, "Password minimal 6 karakter"],
      select: false, // Don't include password in queries by default
    },
    nim: {
      type: String,
      sparse: true, // Allow multiple null values but unique if provided
      maxLength: [20, "NIM tidak boleh lebih dari 20 karakter"],
    },
    jurusan: {
      type: String,
      maxLength: [100, "Jurusan tidak boleh lebih dari 100 karakter"],
    },
    fakultas: {
      type: String,
      maxLength: [100, "Fakultas tidak boleh lebih dari 100 karakter"],
    },
    angkatan: {
      type: String,
      maxLength: [4, "Angkatan tidak boleh lebih dari 4 karakter"],
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Transform the output
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret?._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
