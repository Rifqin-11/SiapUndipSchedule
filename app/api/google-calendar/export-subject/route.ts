import { NextRequest, NextResponse } from "next/server";
import {
  getOAuth2Client,
  setCredentials,
  createCalendarEvent,
  subjectToCalendarEvent,
} from "@/lib/google-calendar";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, selectedDate, tokens } = body;

    if (!subject) {
      return NextResponse.json(
        { error: "Invalid subject data" },
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

    // Convert subject to calendar event
    const event = subjectToCalendarEvent(subject, selectedDate);

    // Create event in Google Calendar
    const calendarEvent = await createCalendarEvent(oauth2Client, event);

    return NextResponse.json({
      success: true,
      event: calendarEvent,
    });
  } catch (error: any) {
    console.error("Error exporting subject:", error);
    return NextResponse.json(
      { error: error.message || "Failed to export subject" },
      { status: 500 }
    );
  }
}
