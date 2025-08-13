import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subjectId, subjectName, attendanceDate, location, notes } = body;

    // Validate required fields
    if (!subjectId || !subjectName || !attendanceDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("schedule_undip");

    // Create attendance history record
    const attendanceRecord = {
      subjectId,
      subjectName,
      attendanceDate: new Date(attendanceDate),
      location: location || "",
      notes: notes || "",
      createdAt: new Date(),
    };

    // Save to attendance_history collection
    const result = await db
      .collection("attendance_history")
      .insertOne(attendanceRecord);

    if (!result.insertedId) {
      return NextResponse.json(
        { error: "Failed to save attendance history" },
        { status: 500 }
      );
    }

    console.log(
      `Attendance history saved: ${subjectName} on ${attendanceDate}`
    );

    return NextResponse.json({
      success: true,
      message: "Attendance history saved successfully",
      data: {
        id: result.insertedId,
        ...attendanceRecord,
      },
    });
  } catch (error) {
    console.error("Attendance history API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("schedule_undip");

    // Get attendance history for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const attendanceHistory = await db
      .collection("attendance_history")
      .find({
        attendanceDate: {
          $gte: sevenDaysAgo,
        },
      })
      .sort({ attendanceDate: -1 })
      .toArray();

    // Group by date for better organization
    interface AttendanceRecord {
      id: string;
      subjectId: string;
      subjectName: string;
      attendanceDate: Date;
      location: string;
      notes: string;
      createdAt: Date;
    }

    const groupedHistory = attendanceHistory.reduce(
      (acc: Record<string, AttendanceRecord[]>, record) => {
        const dateKey = record.attendanceDate.toISOString().split("T")[0];
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push({
          id: record._id.toString(),
          subjectId: record.subjectId,
          subjectName: record.subjectName,
          attendanceDate: record.attendanceDate,
          location: record.location,
          notes: record.notes,
          createdAt: record.createdAt,
        });
        return acc;
      },
      {}
    );

    return NextResponse.json({
      success: true,
      data: {
        history: attendanceHistory.map((record) => ({
          id: record._id.toString(),
          subjectId: record.subjectId,
          subjectName: record.subjectName,
          attendanceDate: record.attendanceDate,
          location: record.location,
          notes: record.notes,
          createdAt: record.createdAt,
        })),
        groupedHistory,
        totalRecords: attendanceHistory.length,
      },
    });
  } catch (error) {
    console.error("Get attendance history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
