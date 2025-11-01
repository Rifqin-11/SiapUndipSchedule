import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyJWTToken } from "@/lib/auth";

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

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const subjectId = searchParams.get("subjectId");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("schedule_undip");

    const baseQuery = {
      userId: decoded.userId,
      attendanceDate: {
        $gte: new Date(date + "T00:00:00.000Z"),
        $lt: new Date(date + "T23:59:59.999Z"),
      },
    };

    // If subjectId is provided, check for specific subject
    const query = subjectId ? { ...baseQuery, subjectId } : baseQuery;

    const attendanceRecords = await db
      .collection("attendance_history")
      .find(query)
      .toArray();

    // If checking for specific subject
    if (subjectId) {
      const hasAttended = attendanceRecords.length > 0;
      return NextResponse.json({
        success: true,
        hasAttended,
        attendanceRecord: hasAttended ? attendanceRecords[0] : null,
      });
    }

    // If checking for all subjects on a date
    const attendanceStatus = attendanceRecords.reduce(
      (acc: Record<string, boolean>, record) => {
        acc[record.subjectId] = true;
        return acc;
      },
      {}
    );

    return NextResponse.json({
      success: true,
      attendanceStatus,
      records: attendanceRecords.map((record) => ({
        id: record._id.toString(),
        subjectId: record.subjectId,
        subjectName: record.subjectName,
        attendanceDate: record.attendanceDate,
        location: record.location,
        notes: record.notes,
        createdAt: record.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get attendance status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
