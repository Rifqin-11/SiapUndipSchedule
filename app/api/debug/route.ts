import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    console.log("Debug: Testing subjects fetch without auth");

    const client = await clientPromise;
    const db = client.db("schedule_undip");
    console.log("Debug: Database connection established");

    // Get collections list to verify database access
    const collections = await db.listCollections().toArray();
    console.log(
      "Debug: Available collections:",
      collections.map((c: any) => c.name)
    );

    // Try to fetch subjects without user filter
    const subjectsCollection = db.collection("subjects");
    const subjectsCount = await subjectsCollection.countDocuments();
    console.log("Debug: Total subjects in database:", subjectsCount);

    const subjects = await subjectsCollection.find({}).limit(5).toArray();
    console.log("Debug: Sample subjects:", subjects.length);

    return NextResponse.json({
      success: true,
      debug: {
        collections: collections.map((c: any) => c.name),
        subjectsCount,
        sampleSubjects: subjects.length,
      },
      message: "Debug endpoint working",
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
