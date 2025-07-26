import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("schedule_undip");

    const settings = await db.collection("settings").findOne({ userId });

    if (!settings) {
      // Return default settings if none found
      const defaultSettings = {
        userId,
        theme: "light",
        notifications: true,
        language: "id",
        timezone: "Asia/Jakarta",
      };
      return NextResponse.json({ success: true, data: defaultSettings });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("schedule_undip");

    const body = await request.json();

    const settings = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Use upsert to create or update
    await db
      .collection("settings")
      .updateOne({ userId: body.userId }, { $set: settings }, { upsert: true });

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
