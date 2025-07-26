import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { dummySubject } from "@/constants";

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("schedule_undip");

    // Check if data already exists
    const existingCount = await db.collection("subjects").countDocuments();

    if (existingCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Data already exists in database",
        count: existingCount,
      });
    }

    // Migrate dummy data to database
    const subjectsWithTimestamp = dummySubject.map((subject) => ({
      ...subject,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await db
      .collection("subjects")
      .insertMany(subjectsWithTimestamp);

    return NextResponse.json({
      success: true,
      message: "Dummy data migrated successfully",
      insertedCount: result.insertedCount,
    });
  } catch (error) {
    console.error("Error migrating data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to migrate data" },
      { status: 500 }
    );
  }
}
