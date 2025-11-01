import { NextRequest, NextResponse } from "next/server";
import {
  getOAuth2Client,
  setCredentials,
  exportScheduleToCalendar,
} from "@/lib/google-calendar";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subjects, tokens } = body;

    if (!subjects || !Array.isArray(subjects)) {
      return NextResponse.json(
        { error: "Invalid subjects data" },
        { status: 400 }
      );
    }

    if (!tokens) {
      return NextResponse.json(
        { error: "No authentication tokens provided" },
        { status: 401 }
      );
    }

    // Set up OAuth2 client with tokens
    const oauth2Client = getOAuth2Client();
    setCredentials(oauth2Client, tokens);

    // Export schedule to Google Calendar (using meetingDates from each subject)
    const results = await exportScheduleToCalendar(oauth2Client, subjects);

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error("Error exporting schedule:", error);
    return NextResponse.json(
      { error: error.message || "Failed to export schedule" },
      { status: 500 }
    );
  }
}
