// app/api/warmup/route.ts
import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Warm up database connection
    await connectMongoDB();
    
    return NextResponse.json({ 
      success: true, 
      message: "Database connection warmed up",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Database warmup failed:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Database warmup failed" 
      },
      { status: 500 }
    );
  }
}