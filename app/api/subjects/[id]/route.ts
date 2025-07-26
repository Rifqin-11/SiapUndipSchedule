import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Subject from "@/models/Subject";
import { dummySubject } from "@/constants";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const subject = await Subject.findOne({ id: params.id });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json(subject);
  } catch (error) {
    console.error(
      "Error fetching subject from MongoDB, using dummy data:",
      error
    );
    // Fallback to dummy data
    const subject = dummySubject.find((s) => s.id === params.id);
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }
    return NextResponse.json(subject);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();

    const subject = await Subject.findOneAndUpdate({ id: params.id }, body, {
      new: true,
      runValidators: true,
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json(subject);
  } catch (error) {
    console.error("Error updating subject:", error);
    return NextResponse.json(
      { error: "Failed to update subject" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const subject = await Subject.findOneAndDelete({ id: params.id });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json(
      { error: "Failed to delete subject" },
      { status: 500 }
    );
  }
}
