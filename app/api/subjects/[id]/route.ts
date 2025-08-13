import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("schedule_undip");

    const subject = await db.collection("subjects").findOne({
      $or: [{ _id: new ObjectId(id) }, { id: id }],
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

    return NextResponse.json({ success: true, data: mappedSubject });
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
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("schedule_undip");

    const body = await request.json();
    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    const result = await db.collection("subjects").updateOne(
      {
        $or: [{ _id: new ObjectId(id) }, { id: id }],
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updateData });
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
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("schedule_undip");

    const result = await db.collection("subjects").deleteOne({
      $or: [{ _id: new ObjectId(id) }, { id: id }],
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Subject deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete subject" },
      { status: 500 }
    );
  }
}
