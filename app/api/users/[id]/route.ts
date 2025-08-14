import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { verifyJWTToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyJWTToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Check if user is trying to access their own data
    if (decoded.userId !== params.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. You can only access your own data.",
        },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db("schedule_undip");

    const user = await db.collection("users").findOne({
      $or: [{ _id: new ObjectId(params.id) }, { id: params.id }],
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyJWTToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Check if user is trying to update their own data
    if (decoded.userId !== params.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. You can only update your own data.",
        },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db("schedule_undip");

    const body = await request.json();
    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    const result = await db.collection("users").updateOne(
      {
        $or: [{ _id: new ObjectId(params.id) }, { id: params.id }],
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updateData });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}
