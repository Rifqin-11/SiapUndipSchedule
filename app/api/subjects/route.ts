import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyJWTToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
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

    return NextResponse.json({ success: true, data: mappedSubjects });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subjects" },
      { status: 500 }
    );
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
    console.log("Received request body:", body);

    // Check if this is a batch insert (array of subjects)
    if (body.subjects && Array.isArray(body.subjects)) {
      console.log(
        "Processing batch insert for",
        body.subjects.length,
        "subjects"
      );

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
      console.log("Batch insert result:", result);

      // Return success with inserted count
      return NextResponse.json({
        success: true,
        message: `Successfully added ${result.insertedCount} subjects`,
        insertedCount: result.insertedCount,
        insertedIds: Object.values(result.insertedIds).map((id) =>
          id.toString()
        ),
      });
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

      return NextResponse.json({
        success: true,
        data: createdSubject,
      });
    }
  } catch (error) {
    console.error("Error creating subject(s):", error);
    return NextResponse.json(
      { success: false, error: "Failed to create subject(s)" },
      { status: 500 }
    );
  }
}
