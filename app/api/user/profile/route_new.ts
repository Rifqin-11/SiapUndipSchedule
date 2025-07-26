import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import { hashPassword, comparePassword } from "@/lib/password";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      name,
      nim,
      jurusan,
      fakultas,
      angkatan,
      avatar,
      currentPassword,
      newPassword,
    } = await request.json();

    console.log("Profile update request:", {
      name,
      nim,
      jurusan,
      fakultas,
      angkatan,
      userId: session.user.id,
    });

    // Validation
    if (!name) {
      return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select("+password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Found user:", {
      id: user._id,
      name: user.name,
      email: user.email,
    });

    // If password is being changed, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to change password" },
          { status: 400 }
        );
      }

      const isCurrentPasswordValid = await comparePassword(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters" },
          { status: 400 }
        );
      }

      user.password = await hashPassword(newPassword);
    }

    // Check if NIM already exists for another user
    if (nim) {
      const existingNIM = await User.findOne({
        nim,
        _id: { $ne: session.user.id },
      });
      if (existingNIM) {
        return NextResponse.json(
          { error: "NIM sudah terdaftar oleh pengguna lain" },
          { status: 400 }
        );
      }
    }

    // Update user fields
    if (name !== undefined) user.name = name;
    if (nim !== undefined) user.nim = nim;
    if (jurusan !== undefined) user.jurusan = jurusan;
    if (fakultas !== undefined) user.fakultas = fakultas;
    if (angkatan !== undefined) user.angkatan = angkatan;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    console.log("User updated successfully:", {
      id: user._id,
      name: user.name,
      nim: user.nim,
      jurusan: user.jurusan,
      fakultas: user.fakultas,
      angkatan: user.angkatan,
    });

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
      isEmailVerified: user.isEmailVerified,
    };

    console.log("Returning user response:", userResponse);

    return NextResponse.json({
      message: "Profil berhasil diperbarui",
      user: userResponse,
    });
  } catch (error: unknown) {
    console.error("Update profile error:", error);

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

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Remove password from response
    const userResponse = user.toJSON();

    return NextResponse.json({
      user: userResponse,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
