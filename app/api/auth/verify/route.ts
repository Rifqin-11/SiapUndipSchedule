import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { comparePassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Return user data without password
    return NextResponse.json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      nim: user.nim,
      jurusan: user.jurusan,
      fakultas: user.fakultas,
      angkatan: user.angkatan,
      avatar: user.avatar,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    });
  } catch (error) {
    console.error("Verify auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
