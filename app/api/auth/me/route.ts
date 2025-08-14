import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyJWTToken, generateJWTToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    // Get tokens from cookies
    const authToken = request.cookies.get("auth_token")?.value;
    const rememberToken = request.cookies.get("remember_token")?.value;

    let user = null;

    // Try to authenticate with JWT token first
    if (authToken) {
      const decoded = verifyJWTToken(authToken);
      if (decoded?.userId) {
        user = await User.findById(decoded.userId);
      }
    }

    // If JWT token failed or doesn't exist, try remember token
    if (!user && rememberToken) {
      user = await User.findOne({
        rememberToken,
        rememberTokenExpires: { $gt: new Date() },
      });

      // If remember token is valid, generate new JWT token
      if (user) {
        const newJwtToken = generateJWTToken(user._id);

        // Set new JWT token cookie
        const response = NextResponse.json({
          success: true,
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
          fromRememberToken: true,
        });

        response.cookies.set("auth_token", newJwtToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60, // 7 days
          path: "/",
        });

        return response;
      }
    }

    // If user found with JWT token
    if (user) {
      return NextResponse.json({
        success: true,
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
      });
    }

    // No valid authentication found
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  } catch (error: unknown) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication check failed" },
      { status: 500 }
    );
  }
}
