import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("schedule_undip");

    // Find subjects that don't have attendanceDates field
    const subjectsWithoutAttendanceDates = await db
      .collection("subjects")
      .find({
        attendanceDates: { $exists: false },
      })
      .toArray();

    // Update each subject to add empty attendanceDates array
    const updateResult = await db
      .collection("subjects")
      .updateMany(
        { attendanceDates: { $exists: false } },
        { $set: { attendanceDates: [] } }
      );

    return NextResponse.json({
      success: true,
      message: `Initialized attendanceDates for ${updateResult.modifiedCount} subjects`,
      foundSubjects: subjectsWithoutAttendanceDates.length,
      updatedSubjects: updateResult.modifiedCount,
    });
  } catch (error) {
    console.error("Error initializing attendanceDates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize attendanceDates" },
      { status: 500 }
    );
  }
}
