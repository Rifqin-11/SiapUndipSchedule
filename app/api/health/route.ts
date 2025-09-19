import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const connection = await connectMongoDB();

    return NextResponse.json({
      success: true,
      message: "Application is healthy",
      database: {
        status: connection.readyState === 1 ? "connected" : "disconnected",
        readyState: connection.readyState,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Health check failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
