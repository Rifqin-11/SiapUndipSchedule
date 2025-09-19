import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { verifyJWTToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          message: "New password must be at least 8 characters long",
          field: "newPassword",
        },
        { status: 400 }
      );
    }

    // Get token from cookies
    const authToken = request.cookies.get("auth_token")?.value;
    const rememberToken = request.cookies.get("remember_token")?.value;

    // Try to get user via JWT token first
    let decoded = null;
    if (authToken) {
      decoded = verifyJWTToken(authToken);
    }

    if (!decoded && !rememberToken) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectMongoDB();

    let user;

    if (decoded) {
      // User authenticated via JWT token
      user = await User.findById(decoded.userId).select("+password");
    } else if (rememberToken) {
      // User authenticated via remember token
      user = await User.findOne({
        rememberToken,
        rememberTokenExpires: { $gt: new Date() },
      }).select("+password");
    }

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        {
          message: "Current password is incorrect",
          field: "currentPassword",
        },
        { status: 400 }
      );
    }

    // Check if new password is different from current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        {
          message: "New password must be different from current password",
          field: "newPassword",
        },
        { status: 400 }
      );
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await User.findByIdAndUpdate(user._id, {
      password: hashedNewPassword,
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
