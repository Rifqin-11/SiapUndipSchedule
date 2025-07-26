import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Subject from "@/models/Subject";
import { dummySubject } from "@/constants";

export async function GET() {
  try {
    await connectDB();
    const subjects = await Subject.find({}).sort({ day: 1, startTime: 1 });
    return NextResponse.json(subjects);
  } catch (error) {
    console.error(
      "Error fetching subjects from MongoDB, using dummy data:",
      error
    );
    // Return dummy data if MongoDB is not available
    return NextResponse.json(dummySubject);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const subject = new Subject(body);
    const savedSubject = await subject.save();

    return NextResponse.json(savedSubject, { status: 201 });
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
}
