import { NextRequest, NextResponse } from "next/server";
import {
  getOAuth2Client,
  setCredentials,
  deleteAllCalendarEvents,
} from "@/lib/google-calendar";

// Increase timeout for this route
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokens, timeMin, timeMax } = body;

    if (!tokens) {
      return NextResponse.json(
        { error: "No authentication tokens provided" },
        { status: 401 }
      );
    }

    // Set up OAuth2 client with tokens
    const oauth2Client = getOAuth2Client();
    setCredentials(oauth2Client, tokens);

    // Delete all events from Google Calendar
    const result = await deleteAllCalendarEvents(
      oauth2Client,
      timeMin,
      timeMax
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error deleting calendar events:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete calendar events" },
      { status: 500 }
    );
  }
}
