import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import {
  hashPassword,
  validatePassword,
  validateEmail,
  generateEmailVerificationToken,
} from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();

    const { name, email, password } = await request.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Password does not meet requirements",
          passwordErrors: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    // Check if user already exists by email
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate email verification token
    const emailVerificationToken = generateEmailVerificationToken();

    // Create new user
    const userId = uuidv4();
    const newUser = new User({
      _id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      nim: null,
      jurusan: null,
      fakultas: null,
      angkatan: null,
      isEmailVerified: false,
      emailVerificationToken,
      profileImage: null,
    });

    await newUser.save();

    // Return success response (without sensitive data)
    return NextResponse.json(
      {
        success: true,
        message:
          "Account created successfully! Please check your email to verify your account.",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          nim: newUser.nim,
          isEmailVerified: newUser.isEmailVerified,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);

    // Handle duplicate key errors
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      const mongoError = error as {
        code: number;
        keyPattern: Record<string, unknown>;
      };
      const field = Object.keys(mongoError.keyPattern)[0];
      return NextResponse.json(
        {
          success: false,
          error: `An account with this ${field} already exists`,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
