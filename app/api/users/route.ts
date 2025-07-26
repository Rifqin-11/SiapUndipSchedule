import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("schedule_undip");

    const users = await db.collection("users").find({}).toArray();

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("schedule_undip");

    const body = await request.json();

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({
      $or: [{ email: body.email }, { nim: body.nim }],
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email or NIM already exists" },
        { status: 400 }
      );
    }

    const user = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("users").insertOne(user);

    return NextResponse.json({
      success: true,
      data: { ...user, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
