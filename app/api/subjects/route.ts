import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyJWTToken } from "@/lib/auth";
import {
  createCachedResponse,
  createErrorResponse,
  checkConditionalRequest,
} from "@/lib/cache";

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

    // Return cached response - subjects jarang berubah jadi gunakan LONG cache
    return createCachedResponse(responseData, "LONG");
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
      const subjectsToInsert = body.subjects.map(
        (subject: Record<string, unknown>) => ({
          ...subject,
          userId: decoded.userId, // Add userId to each subject
          createdAt: new Date(),
          updatedAt: new Date(),
        })
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
      const subject = {
        ...body,
        userId: decoded.userId, // Add userId to subject
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
