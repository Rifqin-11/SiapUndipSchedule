import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("schedule_undip");

    // Sample subjects with different days
    const sampleSubjects = [
      {
        id: "sample1",
        name: "Database Systems",
        code: "CS301",
        day: "Monday",
        time: "08:00-10:00",
        room: "Lab 1",
        lecturer: "Dr. Smith",
        credits: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "sample2", 
        name: "Web Programming",
        code: "CS302",
        day: "Monday",
        time: "10:00-12:00", 
        room: "Lab 2",
        lecturer: "Prof. Johnson",
        credits: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "sample3",
        name: "Data Structures",
        code: "CS201",
        day: "Tuesday",
        time: "13:00-15:00",
        room: "Room A",
        lecturer: "Dr. Brown",
        credits: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "sample4",
        name: "Software Engineering", 
        code: "CS401",
        day: "Wednesday",
        time: "09:00-11:00",
        room: "Room B",
        lecturer: "Prof. Davis",
        credits: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "sample5",
        name: "Computer Networks",
        code: "CS501",
        day: "Wednesday", 
        time: "14:00-16:00",
        room: "Lab 3",
        lecturer: "Dr. Wilson",
        credits: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "sample6",
        name: "Machine Learning",
        code: "CS601",
        day: "Thursday",
        time: "10:00-12:00",
        room: "Lab 4", 
        lecturer: "Prof. Garcia",
        credits: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "sample7",
        name: "Mobile Development",
        code: "CS303",
        day: "Friday",
        time: "08:00-10:00",
        room: "Lab 5",
        lecturer: "Dr. Martinez",
        credits: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    // Clear existing data
    await db.collection("subjects").deleteMany({});

    // Insert sample data
    const result = await db.collection("subjects").insertMany(sampleSubjects);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${result.insertedCount} subjects`,
      data: sampleSubjects,
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed database" },
      { status: 500 }
    );
  }
}