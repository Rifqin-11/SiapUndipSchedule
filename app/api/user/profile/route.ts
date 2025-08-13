import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";

// GET user profile
export async function GET() {
  try {
    await connectMongoDB();

    // For now, return mock data. In real app, you'd get this from session/auth
    const mockUserId = "mock-user-id";

    let user = await User.findOne({ _id: mockUserId });

    // If no user found, create default user
    if (!user) {
      user = new User({
        _id: mockUserId,
        name: "John Doe",
        nim: "24060120140157",
        email: "email@students.undip.ac.id",
        jurusan: "Computer Science",
        fakultas: "Science and Mathematics",
        angkatan: "2022",
        profileImage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await user.save();
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        nim: user.nim,
        email: user.email,
        jurusan: user.jurusan,
        fakultas: user.fakultas,
        angkatan: user.angkatan,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    await connectMongoDB();

    const body = await request.json();
    const { name, nim, email, jurusan, fakultas, angkatan, profileImage } =
      body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    const mockUserId = "mock-user-id";

    const updatedUser = await User.findOneAndUpdate(
      { _id: mockUserId },
      {
        name,
        nim,
        email,
        jurusan,
        fakultas,
        angkatan,
        profileImage,
        updatedAt: new Date(),
      },
      {
        new: true,
        upsert: true, // Create if doesn't exist
        runValidators: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        nim: updatedUser.nim,
        email: updatedUser.email,
        jurusan: updatedUser.jurusan,
        fakultas: updatedUser.fakultas,
        angkatan: updatedUser.angkatan,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
