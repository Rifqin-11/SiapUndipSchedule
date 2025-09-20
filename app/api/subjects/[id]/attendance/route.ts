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
    const { rescheduleDate, action = "add" } = body; // Add action parameter: 'add' or 'remove'

    const client = await clientPromise;
    const db = client.db("schedule_undip");

    // Get current date in YYYY-MM-DD format to match meetingDates format
    const currentDate = new Date();
    const attendanceDate =
      rescheduleDate || currentDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD

    let result;

    if (action === "remove") {
      // Remove attendance: decrement meeting count and remove attendance date
      result = await db.collection("subjects").updateOne(
        {
          $or: [{ _id: new ObjectId(id) }, { id: id }],
          meeting: { $gt: 0 }, // Only decrement if meeting count > 0
        },
        {
          $inc: { meeting: -1 },
          $pull: { attendanceDates: attendanceDate },
          $set: { updatedAt: new Date() },
        }
      );
    } else {
      // Add attendance: increment meeting count and add attendance date
      result = await db.collection("subjects").updateOne(
        {
          $or: [{ _id: new ObjectId(id) }, { id: id }],
        },
        {
          $inc: { meeting: 1 },
          $addToSet: { attendanceDates: attendanceDate },
          $set: { updatedAt: new Date() },
        }
      );
    }

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
      `✅ Attendance ${
        action === "remove" ? "removed" : "recorded"
      } for subject ${id}, meeting count: ${updatedSubject?.meeting}`
    );

    return NextResponse.json(
      {
        success: true,
        message: `Attendance ${
          action === "remove" ? "removed" : "recorded"
        } successfully`,
        data: {
          meeting: updatedSubject?.meeting || 0,
          subjectId: id,
          action: action,
        },
      },
      {
        status: 200,
        headers: {
          // Force no cache untuk response ini
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          // Tambah timestamp untuk cache busting
          "X-Timestamp": Date.now().toString(),
        },
      }
    );
  } catch (error) {
    console.error("Error recording attendance:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record attendance" },
      { status: 500 }
    );
  }
}
