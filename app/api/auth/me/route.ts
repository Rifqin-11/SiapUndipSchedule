import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyJWTToken, generateJWTToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB with optimized connection handling
    await connectMongoDB();

    // Get tokens from cookies
    const authToken = request.cookies.get("auth_token")?.value;
    const rememberToken = request.cookies.get("remember_token")?.value;

    let user = null;

    // Try to authenticate with JWT token first
    if (authToken) {
      const decoded = verifyJWTToken(authToken);
      if (decoded?.userId) {
        // Only select necessary fields for faster query
        user = await User.findById(decoded.userId).select({
          name: 1,
          email: 1,
          nim: 1,
          jurusan: 1,
          fakultas: 1,
          angkatan: 1,
          profileImage: 1,
          isEmailVerified: 1,
          lastLoginAt: 1,
        });
      }
    }

    // If JWT token failed or doesn't exist, try remember token
    if (!user && rememberToken) {
      user = await User.findOne({
        rememberToken,
        rememberTokenExpires: { $gt: new Date() },
      }).select({
        name: 1,
        email: 1,
        nim: 1,
        jurusan: 1,
        fakultas: 1,
        angkatan: 1,
        profileImage: 1,
        isEmailVerified: 1,
        lastLoginAt: 1,
      });

      // If remember token is valid, generate new JWT token
      if (user) {
        const newJwtToken = generateJWTToken(user._id);

        // Set new JWT token cookie with optimized response
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
      });

      // Add performance headers
      response.headers.set(
        "Cache-Control",
        "private, no-cache, no-store, must-revalidate"
      );
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");

      return response;
    }

    // No valid authentication found
    const notAuthResponse = NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );

    // Add performance headers for unauthenticated response too
    notAuthResponse.headers.set(
      "Cache-Control",
      "private, no-cache, no-store, must-revalidate"
    );
    notAuthResponse.headers.set("Pragma", "no-cache");
    notAuthResponse.headers.set("Expires", "0");

    return notAuthResponse;
  } catch (error: unknown) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication check failed" },
      { status: 500 }
    );
  }
}
