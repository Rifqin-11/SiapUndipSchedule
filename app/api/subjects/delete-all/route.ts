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

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} subjects`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Error deleting all subjects:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to delete all subjects",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
