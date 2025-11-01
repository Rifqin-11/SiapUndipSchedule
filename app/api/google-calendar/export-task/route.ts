import { NextRequest, NextResponse } from "next/server";
import {
  getOAuth2Client,
  setCredentials,
  createCalendarEvent,
  taskToCalendarEvent,
} from "@/lib/google-calendar";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task, tokens } = body;

    if (!task) {
      return NextResponse.json({ error: "Invalid task data" }, { status: 400 });
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

    // Convert task to calendar event
    const event = taskToCalendarEvent(task);

    // Create event in Google Calendar
    const calendarEvent = await createCalendarEvent(oauth2Client, event);

    return NextResponse.json({
      success: true,
      event: calendarEvent,
    });
  } catch (error: any) {
    console.error("Error exporting task:", error);
    return NextResponse.json(
      { error: error.message || "Failed to export task" },
      { status: 500 }
    );
  }
}
