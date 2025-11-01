import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyJWTToken } from "@/lib/auth";

interface ExamSchedule {
  id: string;
  name: string;
  examDate: string;
  startTime: string;
  endTime: string;
  room: string;
  examType: "UTS" | "UAS";
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
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

    const body = await request.json();
    const { exams, periodStartDate, periodEndDate, examType } = body;

    if (!exams || !Array.isArray(exams) || !periodStartDate || !periodEndDate) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("schedule_undip");

    // Convert period dates to Date objects
    const periodStart = new Date(periodStartDate);
    const periodEnd = new Date(periodEndDate);

    // Step 1: Get all regular subjects for this user
    const regularSubjects = await db
      .collection("subjects")
      .find({
        userId: decoded.userId,
        specificDate: { $exists: false }, // Only recurring subjects
        meetingDates: { $exists: true, $type: "array" },
      })
      .toArray();

    console.log(`Found ${regularSubjects.length} regular subjects to check`);

    // Step 2: Remove meetings that fall within exam period and add replacements at the end
    const replacementsAdded = [];

    for (const subject of regularSubjects) {
      const meetingDates = subject.meetingDates as string[];
      const removedMeetings: string[] = [];

      // Filter out meetings that fall within exam period
      const updatedMeetingDates = meetingDates.filter((dateStr) => {
        const meetingDate = new Date(dateStr);
        const isInExamPeriod =
          meetingDate >= periodStart && meetingDate <= periodEnd;

        if (isInExamPeriod) {
          removedMeetings.push(dateStr);
          console.log(
            `Removing meeting for ${subject.name}: ${dateStr} (conflicts with exam period)`
          );
        }

        return !isInExamPeriod; // Keep only meetings outside exam period
      });

      const meetingsToReplace = removedMeetings.length;

      if (meetingsToReplace > 0) {
        // Get the day of week for this subject
        const dayOfWeek = subject.day; // e.g., "Monday", "Tuesday", etc.
        const dayNames = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const targetDayIndex = dayNames.indexOf(dayOfWeek);

        if (targetDayIndex === -1) {
          console.log(`Invalid day for subject ${subject.name}: ${dayOfWeek}`);
          continue;
        }

        // Find the last meeting date from the filtered list
        const lastMeetingDate = new Date(
          Math.max(...updatedMeetingDates.map((d) => new Date(d).getTime()))
        );

        // Add replacement meetings after the last meeting
        for (let i = 0; i < meetingsToReplace; i++) {
          // Start from 1 week after last meeting
          let nextMeetingDate = new Date(lastMeetingDate);
          nextMeetingDate.setDate(nextMeetingDate.getDate() + 7 * (i + 1));

          // Adjust to correct day of week
          while (nextMeetingDate.getDay() !== targetDayIndex) {
            nextMeetingDate.setDate(nextMeetingDate.getDate() + 1);
          }

          // Make sure it doesn't conflict with exam period
          let attempts = 0;
          while (
            nextMeetingDate >= periodStart &&
            nextMeetingDate <= periodEnd &&
            attempts < 10
          ) {
            nextMeetingDate.setDate(nextMeetingDate.getDate() + 7);
            attempts++;
          }

          const replacementDateStr = nextMeetingDate
            .toISOString()
            .split("T")[0];

          // Check if date already exists to avoid duplicates
          if (!updatedMeetingDates.includes(replacementDateStr)) {
            updatedMeetingDates.push(replacementDateStr);

            replacementsAdded.push({
              subjectName: subject.name,
              removedDate: removedMeetings[i],
              replacementDate: replacementDateStr,
            });

            console.log(
              `Added replacement meeting for ${subject.name}: ${replacementDateStr} (replacing ${removedMeetings[i]})`
            );
          }
        }

        // Sort the meeting dates
        updatedMeetingDates.sort(
          (a, b) => new Date(a).getTime() - new Date(b).getTime()
        );

        // Update subject with new meeting dates
        await db.collection("subjects").updateOne(
          { _id: subject._id },
          {
            $set: {
              meetingDates: updatedMeetingDates,
              updatedAt: new Date(),
            },
          }
        );
      }
    }

    console.log(`Added ${replacementsAdded.length} replacement meetings`);

    // Step 3: Create exam schedule subjects (one-time events)
    const examSubjects = exams.map((exam: ExamSchedule) => {
      // Parse the day from examDate
      const examDateObj = new Date(exam.examDate);
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dayName = dayNames[examDateObj.getDay()];

      return {
        name: `${exam.name} - ${exam.examType}`,
        day: dayName,
        startTime: exam.startTime,
        endTime: exam.endTime,
        room: exam.room,
        lecturer: [`${exam.examType} Exam`],
        meeting: 0,
        category: "High", // Exams are high priority
        specificDate: exam.examDate, // This makes it a one-time event
        meetingDates: [exam.examDate], // Only one meeting date
        userId: decoded.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        examType: exam.examType, // Add exam type for identification
      };
    });

    // Insert all exam subjects
    const insertResult = await db
      .collection("subjects")
      .insertMany(examSubjects);

    console.log(`Inserted ${insertResult.insertedCount} exam schedules`);

    // Fetch the newly created exam subjects with their IDs
    const insertedIds = Object.values(insertResult.insertedIds);
    const insertedSubjects = await db
      .collection("subjects")
      .find({
        _id: { $in: insertedIds },
      })
      .toArray();

    // Fetch updated regular subjects (those with replaced meetings)
    const updatedSubjects = await db
      .collection("subjects")
      .find({
        userId: decoded.userId,
        specificDate: { $exists: false },
        meetingDates: { $exists: true, $type: "array" },
      })
      .toArray();

    // Return success response with detailed info and subjects for auto-sync
    return NextResponse.json({
      success: true,
      message: `Successfully added ${exams.length} exam schedules`,
      details: {
        examsAdded: exams.length,
        replacementMeetingsAdded: replacementsAdded.length,
        replacements: replacementsAdded,
      },
      insertedSubjects, // New exam subjects
      updatedSubjects, // Regular subjects with replaced meetings
    });
  } catch (error) {
    console.error("Error adding exam schedules:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to add exam schedules",
      },
      { status: 500 }
    );
  }
}
