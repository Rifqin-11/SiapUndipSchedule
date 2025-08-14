import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyJWTToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();

    // Get tokens from cookies
    const authToken = request.cookies.get("auth_token")?.value;
    const rememberToken = request.cookies.get("remember_token")?.value;

    // If there's a JWT token, verify it and clear remember token from database
    if (authToken) {
      const decoded = verifyJWTToken(authToken);
      if (decoded?.userId) {
        // Clear remember token from database
        await User.findByIdAndUpdate(decoded.userId, {
          $unset: {
            rememberToken: 1,
            rememberTokenExpires: 1,
          },
        });
      }
    }

    // If there's only a remember token, find user and clear it
    if (rememberToken && !authToken) {
      await User.findOneAndUpdate(
        { rememberToken },
        {
          $unset: {
            rememberToken: 1,
            rememberTokenExpires: 1,
          },
        }
      );
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear cookies
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    response.cookies.set("remember_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Logout error:", error);

    // Even if there's an error, clear the cookies
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    response.cookies.set("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    response.cookies.set("remember_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return response;
  }
}
