// File: app/api/schedule/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const subjects: Array<{
      name: string;
      day: string;
      startTime: string;
      endTime: string;
      room: string;
      lecturer: string[];
    }> = await req.json();

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json(
        { error: "Payload tidak valid" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(); // gunakan default database dari URI
    const col = db.collection("schedules");
    const result = await col.insertMany(subjects);

    return NextResponse.json({ insertedCount: result.insertedCount });
  } catch (err: any) {
    console.error("SCHEDULE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
