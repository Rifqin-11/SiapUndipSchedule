import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import {
  comparePassword,
  generateJWTToken,
  generateRememberToken,
  getRememberTokenExpiration,
  validateEmail,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();

    const { email, password, rememberMe } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
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

    // Find user by email (include password for comparison)
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password +rememberToken +rememberTokenExpires");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const jwtToken = generateJWTToken(user._id);

    // Update last login time
    user.lastLoginAt = new Date();

    // Handle remember me functionality
    let rememberToken = null;
    if (rememberMe) {
      rememberToken = generateRememberToken();
      user.rememberToken = rememberToken;
      user.rememberTokenExpires = getRememberTokenExpiration();
    } else {
      // Clear existing remember token if user doesn't want to be remembered
      user.rememberToken = undefined;
      user.rememberTokenExpires = undefined;
    }

    await user.save();

    // Prepare response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        nim: user.nim,
        jurusan: user.jurusan,
        fakultas: user.fakultas,
        angkatan: user.angkatan,
        profileImage: user.profileImage,
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt,
      },
      token: jwtToken,
    });

    // Set HTTP-only cookies for security
    const isProduction = process.env.NODE_ENV === "production";

    // Set JWT token cookie (7 days)
    response.cookies.set("auth_token", jwtToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    // Set remember me token cookie if enabled (30 days)
    if (rememberMe && rememberToken) {
      response.cookies.set("remember_token", rememberToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
        path: "/",
      });
    }

    return response;
  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
