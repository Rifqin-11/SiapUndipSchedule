import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { verifyJWTToken } from "@/lib/auth";
import { calculateMeetingDates } from "@/utils/meeting-calculator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user from authentication
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

    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("schedule_undip");

    // Only find subject that belongs to the authenticated user
    const subject = await db.collection("subjects").findOne({
      $and: [
        { $or: [{ _id: new ObjectId(id) }, { id: id }] },
        { userId: decoded.userId },
      ],
    });

    if (!subject) {
      return NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 }
      );
    }

    // Ensure the subject has a consistent id field
    const mappedSubject = {
      ...subject,
      id: subject._id.toString(), // Ensure id is the string version of _id
    };

    return NextResponse.json(
      { success: true, data: mappedSubject },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "X-Timestamp": Date.now().toString(),
        },
      }
    );
  } catch (error) {
    console.error("Error fetching subject:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subject" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user from authentication
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

    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("schedule_undip");

    const body = await request.json();

    // Recalculate meeting dates if subject type or schedule changed
    let meetingDates: string[] | undefined = body.meetingDates;

    if (body.specificDate) {
      // One-time subject: only one meeting on the specific date
      meetingDates = [body.specificDate];
      console.log(
        `Updated to one-time subject with single meeting on ${body.specificDate}`
      );
    } else if (body.day && body.startDate && typeof body.day === "string") {
      // Recurring weekly subject: calculate 14 meeting dates
      try {
        const calculatedDates = calculateMeetingDates(body.startDate, body.day);
        meetingDates = calculatedDates;
        console.log(
          `Recalculated ${calculatedDates.length} meeting dates for recurring subject`
        );
      } catch (error) {
        console.error(`Failed to recalculate meeting dates:`, error);
        // Keep existing meetingDates if calculation fails
      }
    }

    const updateData = {
      ...body,
      meetingDates: meetingDates,
      updatedAt: new Date(),
    };

    // Only update subject that belongs to the authenticated user
    const result = await db.collection("subjects").updateOne(
      {
        $and: [
          { $or: [{ _id: new ObjectId(id) }, { id: id }] },
          { userId: decoded.userId },
        ],
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 }
      );
    }

    const response = NextResponse.json({ success: true, data: updateData });

    // Tambahkan no-cache headers untuk mutations
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("Error updating subject:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update subject" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user from authentication
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

    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("schedule_undip");

    // Only delete subject that belongs to the authenticated user
    const result = await db.collection("subjects").deleteOne({
      $and: [
        { $or: [{ _id: new ObjectId(id) }, { id: id }] },
        { userId: decoded.userId },
      ],
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Subject deleted successfully",
    });

    // Tambahkan no-cache headers untuk mutations
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete subject" },
      { status: 500 }
    );
  }
}
