import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { verifyJWTToken } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user from authentication
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

    const { id } = await params;
    const body = await request.json();
    const { originalDate, newDate, reason, startTime, endTime, room } = body;

    if (!originalDate || !newDate) {
      return NextResponse.json(
        { success: false, error: "Original date and new date are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("schedule_undip");

    // Create reschedule record
    const rescheduleData = {
      subjectId: id,
      originalDate,
      newDate,
      reason: reason || "Reschedule",
      startTime: startTime || "",
      endTime: endTime || "",
      room: room || "",
      createdAt: new Date(),
    };

    // Add reschedule to subject's reschedules array (only for user's subjects)
    const result = await db.collection("subjects").updateOne(
      {
        $and: [
          { $or: [{ _id: new ObjectId(id) }, { id: id }] },
          { userId: decoded.userId },
        ],
      },
      {
        $set: { updatedAt: new Date() },
      }
    );

    // Then add the reschedule data
    await db.collection("subjects").updateOne(
      {
        $and: [
          { $or: [{ _id: new ObjectId(id) }, { id: id }] },
          { userId: decoded.userId },
        ],
      },
      {
        $addToSet: { reschedules: rescheduleData },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 }
      );
    }

    console.log(
      `Reschedule added for subject ${id}: ${originalDate} -> ${newDate}`
    );

    return NextResponse.json({
      success: true,
      message: "Class reschedule recorded successfully",
      data: rescheduleData,
    });
  } catch (error) {
    console.error("Error recording reschedule:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record reschedule" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user from authentication
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

    const { id } = await params;
    const body = await request.json();
    const { rescheduleDate } = body;

    if (!rescheduleDate) {
      return NextResponse.json(
        { success: false, error: "Reschedule date is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("schedule_undip");

    // First, get the subject to find the exact reschedule entry (only user's subjects)
    const subject = await db.collection("subjects").findOne({
      $and: [
        { $or: [{ _id: new ObjectId(id) }, { id: id }] },
        { userId: decoded.userId },
      ],
    });

    if (!subject) {
      return NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 }
      );
    }

    // Find the reschedule entry to remove
    const reschedules = subject.reschedules || [];
    const targetDate = new Date(rescheduleDate);
    const targetDateString = targetDate.toISOString().split("T")[0];

    console.log(`Searching for reschedule with date: ${rescheduleDate}`);
    console.log(`Target date string: ${targetDateString}`);
    console.log(`Existing reschedules:`, reschedules);

    // Filter out the reschedule that matches the date
    const updatedReschedules = reschedules.filter(
      (reschedule: {
        subjectId: string;
        originalDate: string;
        newDate: string | Date;
        reason: string;
        startTime?: string;
        endTime?: string;
        room?: string;
        createdAt: Date;
      }) => {
        const rescheduleDate = new Date(reschedule.newDate);
        const rescheduleString = rescheduleDate.toISOString().split("T")[0];
        console.log(`Comparing: ${rescheduleString} !== ${targetDateString}`);
        return rescheduleString !== targetDateString;
      }
    );

    console.log(`Filtered reschedules:`, updatedReschedules);

    // Update the subject with the filtered reschedules array (only user's subjects)
    const result = await db.collection("subjects").updateOne(
      {
        $and: [
          { $or: [{ _id: new ObjectId(id) }, { id: id }] },
          { userId: decoded.userId },
        ],
      },
      {
        $set: {
          reschedules: updatedReschedules,
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: "No reschedule was deleted" },
        { status: 400 }
      );
    }

    console.log(
      `Reschedule deleted for subject ${id} on date ${rescheduleDate}`
    );

    return NextResponse.json({
      success: true,
      message: "Reschedule deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting reschedule:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete reschedule" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user from authentication
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

    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("schedule_undip");

    // Get subject with reschedules (only user's subjects)
    const subject = await db.collection("subjects").findOne({
      $and: [
        { $or: [{ _id: new ObjectId(id) }, { id: id }] },
        { userId: decoded.userId },
      ],
    });

    if (!subject) {
      return NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        reschedules: subject.reschedules || [],
      },
    });
  } catch (error) {
    console.error("Error fetching reschedules:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reschedules" },
      { status: 500 }
    );
  }
}
