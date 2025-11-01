import { NextRequest, NextResponse } from "next/server";
import {
  getOAuth2Client,
  setCredentials,
  exportTasksToCalendar,
} from "@/lib/google-calendar";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tasks, tokens } = body;

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json(
        { error: "Invalid tasks data" },
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

    // Export tasks to Google Calendar
    const results = await exportTasksToCalendar(oauth2Client, tasks);

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error("Error exporting tasks:", error);
    return NextResponse.json(
      { error: error.message || "Failed to export tasks" },
      { status: 500 }
    );
  }
}
