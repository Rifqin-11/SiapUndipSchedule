import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyJWTToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
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

    // Create attendance history record with userId
    const attendanceRecord = {
      userId: decoded.userId, // Add userId to attendance record
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

export async function GET(request: NextRequest) {
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

    const client = await clientPromise;
    const db = client.db("schedule_undip");

    // Get ALL attendance history for the authenticated user (remove 7 days limit)
    const attendanceHistory = await db
      .collection("attendance_history")
      .find({
        userId: decoded.userId, // Filter by authenticated user
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
