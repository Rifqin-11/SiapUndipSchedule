import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function DELETE() {
  try {
    const client = await clientPromise;
    const db = client.db("schedule_undip");

    console.log("Attempting to delete all subjects...");

    // Delete all documents in the subjects collection
    const result = await db.collection("subjects").deleteMany({});

    console.log("Delete all subjects result:", result);

    const response = NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} subjects`,
      deletedCount: result.deletedCount,
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
    console.error("Error deleting all subjects:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete all subjects",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
