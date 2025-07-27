import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, timestamp, url } = body;

    // Validate required fields
    if (!code || !timestamp || !url) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate code format (12 character hex string)
    if (!/^[a-f0-9]{12}$/i.test(code)) {
      return NextResponse.json(
        { error: "Invalid code format" },
        { status: 400 }
      );
    }

    // Here you can save to MongoDB if needed
    // For now, we'll just return success
    // Example MongoDB integration:
    /*
    import { connectToDatabase } from "@/lib/mongodb";

    const { db } = await connectToDatabase();
    const result = await db.collection("attendance_history").insertOne({
      code,
      timestamp: new Date(timestamp),
      url,
      createdAt: new Date(),
    });
    */

    return NextResponse.json({
      success: true,
      message: "Attendance history saved successfully",
      data: {
        code,
        timestamp,
        url,
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
    // Get attendance history
    // For now, return mock data
    const mockHistory = [
      {
        id: "1",
        code: "a0907c7f6eae",
        url: "https://siap.undip.ac.id/a/a0907c7f6eae",
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: mockHistory,
    });
  } catch (error) {
    console.error("Get attendance history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
