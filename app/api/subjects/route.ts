import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyJWTToken } from "@/lib/auth";
import {
  createCachedResponse,
  createErrorResponse,
  checkConditionalRequest,
} from "@/lib/cache";
import { calculateMeetingDates } from "@/utils/meeting-calculator";

export async function GET(request: NextRequest) {
  try {
    // Get user from authentication
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return createErrorResponse("Authentication required", 401);
    }

    const decoded = verifyJWTToken(token);
    if (!decoded) {
      return createErrorResponse("Invalid token", 401);
    }

    const client = await clientPromise;
    const db = client.db("schedule_undip");

    // Only fetch subjects that belong to the authenticated user
    const subjects = await db
      .collection("subjects")
      .find({
        userId: decoded.userId,
      })
      .toArray();

    // Ensure each subject has a consistent id field
    const mappedSubjects = subjects.map((subject) => ({
      ...subject,
      id: subject._id.toString(), // Ensure id is the string version of _id
    }));

    const responseData = { success: true, data: mappedSubjects };

    // Check conditional request untuk 304 Not Modified
    const conditionalResponse = checkConditionalRequest(request, responseData);
    if (conditionalResponse) {
      return conditionalResponse;
    }

    // Return response without cache untuk testing attendance updates
    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "X-Timestamp": Date.now().toString(),
      },
    });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return createErrorResponse("Failed to fetch subjects", 500);
  }
}

export async function POST(request: NextRequest) {
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

    const client = await clientPromise;
    const db = client.db("schedule_undip");

    const body = await request.json();

    // Check if this is a batch insert (array of subjects)
    if (body.subjects && Array.isArray(body.subjects)) {
      const { subjects, startDate } = body;

      if (!startDate) {
        return NextResponse.json(
          {
            success: false,
            error: "Start date is required for calculating meeting dates",
          },
          { status: 400 }
        );
      }

      const subjectsToInsert = subjects.map(
        (subject: Record<string, unknown>) => {
          let meetingDates: string[] = [];

          // Calculate meeting dates based on subject type
          if (
            subject.specificDate &&
            typeof subject.specificDate === "string"
          ) {
            // One-time subject: only one meeting on the specific date
            meetingDates = [subject.specificDate];
          } else if (subject.day && typeof subject.day === "string") {
            // Recurring weekly subject: calculate 14 meeting dates
            try {
              meetingDates = calculateMeetingDates(startDate, subject.day);
            } catch (error) {
              console.error(
                `Failed to calculate meeting dates for subject ${subject.name}:`,
                error
              );
              // Continue without meetingDates if calculation fails
            }
          }

          return {
            ...subject,
            userId: decoded.userId, // Add userId to each subject
            startDate: startDate, // Add start date
            meetingDates: meetingDates, // Add calculated meeting dates
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }
      );

      const result = await db
        .collection("subjects")
        .insertMany(subjectsToInsert);

      // Return success with inserted count
      const response = NextResponse.json({
        success: true,
        message: `Successfully added ${result.insertedCount} subjects`,
        insertedCount: result.insertedCount,
        insertedIds: Object.values(result.insertedIds).map((id) =>
          id.toString()
        ),
      });

      // Tambahkan no-cache headers untuk mutations
      response.headers.set(
        "Cache-Control",
        "no-cache, no-store, must-revalidate"
      );
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");

      return response;
    } else {
      // Single subject insert (existing functionality)
      let meetingDates: string[] = [];
      let startDate = body.startDate;

      // If no startDate provided, try to get it from existing subjects
      if (!startDate && body.day && typeof body.day === "string") {
        try {
          // Find any existing subject for this user that has a startDate
          const existingSubject = await db.collection("subjects").findOne({
            userId: decoded.userId,
            startDate: { $exists: true, $ne: null },
          });

          if (existingSubject && existingSubject.startDate) {
            startDate = existingSubject.startDate;
            console.log(
              `Using existing startDate: ${startDate} for new subject: ${body.name}`
            );
          }
        } catch (error) {
          console.error("Error finding existing startDate:", error);
        }
      }

      // Calculate meeting dates based on subject type
      if (body.specificDate) {
        // One-time subject: only one meeting on the specific date
        meetingDates = [body.specificDate];
        console.log(
          `Created one-time subject ${body.name} with single meeting on ${body.specificDate}`
        );
      } else if (body.day && startDate && typeof body.day === "string") {
        // Recurring weekly subject: calculate 14 meeting dates
        try {
          meetingDates = calculateMeetingDates(startDate, body.day);
          console.log(
            `Calculated ${meetingDates.length} meeting dates for recurring subject ${body.name}`
          );
        } catch (error) {
          console.error(
            `Failed to calculate meeting dates for subject ${body.name}:`,
            error
          );
          // Continue without meetingDates if calculation fails
        }
      }

      const subject = {
        ...body,
        userId: decoded.userId, // Add userId to subject
        startDate: startDate, // Add startDate (from body or existing)
        meetingDates: meetingDates, // Add calculated meeting dates
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection("subjects").insertOne(subject);

      // Return the subject with the MongoDB _id as the id field
      const createdSubject = {
        ...subject,
        _id: result.insertedId,
        id: result.insertedId.toString(), // Ensure id is the string version of _id
      };

      const response = NextResponse.json({
        success: true,
        data: createdSubject,
      });

      // Tambahkan no-cache headers untuk mutations
      response.headers.set(
        "Cache-Control",
        "no-cache, no-store, must-revalidate"
      );
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");

      return response;
    }
  } catch (error) {
    console.error("Error creating subject(s):", error);
    return NextResponse.json(
      { success: false, error: "Failed to create subject(s)" },
      { status: 500 }
    );
  }
}
