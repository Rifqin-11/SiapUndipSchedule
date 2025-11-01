import { NextRequest, NextResponse } from "next/server";
import { getTokensFromCode } from "@/lib/google-calendar";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      // User denied access or other error
      return NextResponse.redirect(
        new URL(`/schedule?calendar_error=${error}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/schedule?calendar_error=no_code", request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);

    // Redirect back to schedule page with tokens
    const redirectUrl = new URL("/schedule", request.url);
    redirectUrl.searchParams.set("calendar_connected", "true");
    redirectUrl.searchParams.set(
      "tokens",
      encodeURIComponent(JSON.stringify(tokens))
    );

    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error("Error in Google Calendar callback:", error);
    return NextResponse.redirect(
      new URL("/schedule?calendar_error=token_exchange_failed", request.url)
    );
  }
}
