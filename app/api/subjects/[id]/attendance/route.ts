import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { rescheduleDate } = body; // Optional: if attending on a rescheduled date

    const client = await clientPromise;
    const db = client.db("schedule_undip");

    // Get current date in readable format
    const currentDate = new Date();
    const attendanceDate =
      rescheduleDate ||
      currentDate.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    // First, increment the meeting count
    const result = await db.collection("subjects").updateOne(
      {
        $or: [{ _id: new ObjectId(id) }, { id: id }],
      },
      {
        $inc: { meeting: 1 },
        $set: { updatedAt: new Date() },
      }
    );

    // Then, add the attendance date to the array
    await db.collection("subjects").updateOne(
      {
        $or: [{ _id: new ObjectId(id) }, { id: id }],
      },
      {
        $addToSet: { attendanceDates: attendanceDate },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 }
      );
    }

    // Get the updated subject to return current meeting count
    const updatedSubject = await db.collection("subjects").findOne({
      $or: [{ _id: new ObjectId(id) }, { id: id }],
    });

    console.log(
      `Attendance recorded for subject ${id}, meeting count: ${updatedSubject?.meeting}`
    );

    return NextResponse.json({
      success: true,
      message: "Attendance recorded successfully",
      data: {
        meeting: updatedSubject?.meeting || 0,
        subjectId: id,
      },
    });
  } catch (error) {
    console.error("Error recording attendance:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record attendance" },
      { status: 500 }
    );
  }
}
