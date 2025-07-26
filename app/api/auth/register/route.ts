import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, nim, jurusan, fakultas, angkatan } =
      await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nama, email, dan password wajib diisi" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Check if NIM already exists (if provided)
    if (nim) {
      const existingNIM = await User.findOne({ nim });
      if (existingNIM) {
        return NextResponse.json(
          { error: "NIM sudah terdaftar" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      nim,
      jurusan,
      fakultas,
      angkatan,
    });

    await user.save();

    // Return user data without password
    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      nim: user.nim,
      jurusan: user.jurusan,
      fakultas: user.fakultas,
      angkatan: user.angkatan,
      avatar: user.avatar,
      role: user.role,
    };

    return NextResponse.json(
      {
        message: "Akun berhasil dibuat",
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Register error:", error);

    // Handle mongoose validation errors
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "ValidationError"
    ) {
      const mongooseError = error as unknown as {
        errors: Record<string, { message: string }>;
      };
      const errorMessages = Object.values(mongooseError.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        { error: errorMessages.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
