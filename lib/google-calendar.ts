import { google } from "googleapis";
import type { Subject } from "@/hooks/useSubjects";
import type { Task } from "@/hooks/useTasks";

// Initialize OAuth2 client
export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// Generate Google Calendar authentication URL
export function getAuthUrl() {
  const oauth2Client = getOAuth2Client();

  const scopes = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
}

// Exchange authorization code for tokens
export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// Set credentials for OAuth2 client
export function setCredentials(oauth2Client: any, tokens: any) {
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

// Convert Subject to Google Calendar Event
export function subjectToCalendarEvent(
  subject: Subject,
  selectedDate?: string
) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Get the next occurrence of the subject's day
  const today = new Date();
  let targetDate = new Date(today);

  if (selectedDate) {
    targetDate = new Date(selectedDate);
  } else if (subject.specificDate) {
    targetDate = new Date(subject.specificDate);
  } else {
    const targetDayIndex = days.indexOf(subject.day);
    const currentDayIndex = today.getDay();
    const daysUntilTarget = (targetDayIndex - currentDayIndex + 7) % 7;
    targetDate.setDate(
      today.getDate() + (daysUntilTarget === 0 ? 0 : daysUntilTarget)
    );
  }

  // Parse time from startTime and endTime - support both ":" and "." as separator
  const startTimeParts = subject.startTime.replace(".", ":").split(":");
  const endTimeParts = subject.endTime.replace(".", ":").split(":");

  const startHour = parseInt(startTimeParts[0]);
  const startMinute = parseInt(startTimeParts[1] || "0");
  const endHour = parseInt(endTimeParts[0]);
  const endMinute = parseInt(endTimeParts[1] || "0");

  // Create date with timezone awareness for Asia/Jakarta (WIB)
  const startDateTime = new Date(targetDate);
  startDateTime.setHours(startHour, startMinute, 0, 0);

  const endDateTime = new Date(targetDate);
  endDateTime.setHours(endHour, endMinute, 0, 0);

  const lecturerString = Array.isArray(subject.lecturer)
    ? subject.lecturer.join(", ")
    : subject.lecturer || "-";

  // Check if this is an exam
  const isExam = subject.examType === "UTS" || subject.examType === "UAS";
  const examPrefix = isExam ? `${subject.examType} - ` : "";

  // Different description and color for exams vs regular classes
  const description = isExam
    ? `📝 ${subject.examType}\nRuangan: ${subject.room}\nDosen: ${lecturerString}`
    : `Ruangan: ${subject.room}\nDosen: ${lecturerString}\nPertemuan: ${
        subject.meeting || "-"
      }`;

  return {
    summary: `${examPrefix}${subject.name}`,
    description,
    location: subject.room,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: "Asia/Jakarta",
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: "Asia/Jakarta",
    },
    colorId: isExam ? "11" : "9", // Red for exams, Blue for regular classes
    reminders: {
      useDefault: false,
      overrides: isExam
        ? [
            { method: "popup", minutes: 24 * 60 }, // 1 day before for exams
            { method: "popup", minutes: 60 }, // 1 hour before
            { method: "popup", minutes: 30 },
          ]
        : [
            { method: "popup", minutes: 30 },
            { method: "popup", minutes: 10 },
          ],
    },
  };
}

// Convert Task to Google Calendar Event
export function taskToCalendarEvent(task: Task) {
  const dueDate = new Date(task.dueDate);

  // Create all-day event or timed event based on whether time is specified
  let eventTime;
  if (task.dueTime) {
    const [hour, minute] = task.dueTime.split(":").map(Number);
    const startDateTime = new Date(dueDate);
    startDateTime.setHours(hour, minute, 0, 0);

    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(hour + 1, minute, 0, 0); // 1 hour duration

    eventTime = {
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "Asia/Jakarta",
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "Asia/Jakarta",
      },
    };
  } else {
    // All-day event
    eventTime = {
      start: {
        date: dueDate.toISOString().split("T")[0],
      },
      end: {
        date: dueDate.toISOString().split("T")[0],
      },
    };
  }

  const subjectName = task.subject?.name || "Umum";

  return {
    summary: `📝 ${task.title}`,
    description: `Tugas: ${
      task.description || "-"
    }\nMata Kuliah: ${subjectName}\nPrioritas: ${task.priority}\nStatus: ${
      task.status
    }`,
    ...eventTime,
    colorId:
      task.priority === "high" ? "11" : task.priority === "medium" ? "5" : "2", // Red for high, Yellow for medium, Green for low
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 24 * 60 }, // 1 day before
        { method: "popup", minutes: 60 }, // 1 hour before
      ],
    },
  };
}

// Create event in Google Calendar
export async function createCalendarEvent(oauth2Client: any, event: any) {
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
  });

  return response.data;
}

// Create multiple events in batch
export async function createMultipleEvents(oauth2Client: any, events: any[]) {
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    try {
      console.log(
        `[Export] Creating event ${i + 1}/${events.length}: ${event.summary}`
      );
      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });
      results.push({ success: true, data: response.data });
      successCount++;
      console.log(`[Export] ✅ Success: ${event.summary}`);
    } catch (error: any) {
      console.error(`[Export] ❌ Failed: ${event.summary}`, error.message);
      results.push({
        success: false,
        error: error.message,
        event: event.summary,
      });
      failCount++;
    }
  }

  console.log(
    `[Export] Summary: ${successCount} succeeded, ${failCount} failed out of ${events.length} total`
  );
  return results;
}

// Create recurring event for weekly schedule (or one-time for exams)
// Create individual events for each meeting date
export function createEventsFromMeetingDates(subject: Subject) {
  const events = [];

  // Check if this is an exam schedule (UTS/UAS) or specific date
  const isExam = subject.examType === "UTS" || subject.examType === "UAS";
  const isSpecificDate = subject.specificDate !== undefined;

  // If it's an exam or has a specific date, create one event
  if (isExam || isSpecificDate) {
    console.log(`[Export] Creating exam/specific event for ${subject.name}`);
    return [subjectToCalendarEvent(subject)];
  }

  // If subject has meetingDates, create individual events for each date
  if (
    subject.meetingDates &&
    Array.isArray(subject.meetingDates) &&
    subject.meetingDates.length > 0
  ) {
    console.log(
      `[Export] Creating ${subject.meetingDates.length} events for ${subject.name} from meetingDates`
    );
    for (const meetingDate of subject.meetingDates) {
      try {
        const event = subjectToCalendarEvent(subject, meetingDate);
        events.push(event);
      } catch (error) {
        console.error(
          `[Export] Error creating event for ${subject.name} on ${meetingDate}:`,
          error
        );
      }
    }
    return events;
  }

  // Fallback: if no meetingDates, create recurring event (legacy support)
  console.log(
    `[Export] No meetingDates found for ${subject.name}, creating recurring event`
  );
  const event = subjectToCalendarEvent(subject);
  return [
    {
      ...event,
      recurrence: [
        `RRULE:FREQ=WEEKLY;COUNT=14`, // Default 14 weeks for legacy subjects
      ],
    },
  ];
}

// Create event for rescheduled class
export function createRescheduleEvent(subject: Subject, reschedule: any) {
  const rescheduleDate = new Date(reschedule.newDate);

  // Use reschedule time if available, otherwise use subject's original time
  const startTime = reschedule.startTime || subject.startTime;
  const endTime = reschedule.endTime || subject.endTime;
  const room = reschedule.room || subject.room;

  // Parse time - support both ":" and "." as separator
  const startTimeParts = startTime.replace(".", ":").split(":");
  const endTimeParts = endTime.replace(".", ":").split(":");

  const startHour = parseInt(startTimeParts[0]);
  const startMinute = parseInt(startTimeParts[1] || "0");
  const endHour = parseInt(endTimeParts[0]);
  const endMinute = parseInt(endTimeParts[1] || "0");

  const startDateTime = new Date(rescheduleDate);
  startDateTime.setHours(startHour, startMinute, 0, 0);

  const endDateTime = new Date(rescheduleDate);
  endDateTime.setHours(endHour, endMinute, 0, 0);

  const lecturerString = Array.isArray(subject.lecturer)
    ? subject.lecturer.join(", ")
    : subject.lecturer || "-";

  const originalDate = new Date(reschedule.originalDate).toLocaleDateString(
    "id-ID",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return {
    summary: `🔄 ${subject.name} (Reschedule)`,
    description: `⚠️ JADWAL PENGGANTI\n\nJadwal Asli: ${originalDate}\nAlasan: ${
      reschedule.reason
    }\n\nRuangan: ${room}\nDosen: ${lecturerString}\nPertemuan: ${
      subject.meeting || "-"
    }`,
    location: room,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: "Asia/Jakarta",
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: "Asia/Jakarta",
    },
    colorId: "5", // Yellow/Orange color for reschedules
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 24 * 60 }, // 1 day before
        { method: "popup", minutes: 60 }, // 1 hour before
        { method: "popup", minutes: 30 },
      ],
    },
  };
}

// Export all subjects based on their meetingDates (including reschedules)
export async function exportScheduleToCalendar(
  oauth2Client: any,
  subjects: Subject[]
) {
  console.log(`[Export] Starting export for ${subjects.length} subjects`);
  const allEvents = [];

  // Create events based on meetingDates for each subject
  for (const subject of subjects) {
    console.log(`[Export] Processing subject: ${subject.name}`, {
      day: subject.day,
      meetingDatesCount: subject.meetingDates?.length || 0,
      startTime: subject.startTime,
      endTime: subject.endTime,
    });

    // Get all events for this subject (based on meetingDates)
    const subjectEvents = createEventsFromMeetingDates(subject);
    allEvents.push(...subjectEvents);

    // Add reschedule events as separate one-time events
    if (subject.reschedules && subject.reschedules.length > 0) {
      console.log(
        `[Export] Adding ${subject.reschedules.length} reschedule events for ${subject.name}`
      );
      for (const reschedule of subject.reschedules) {
        allEvents.push(createRescheduleEvent(subject, reschedule));
      }
    }
  }

  console.log(`[Export] Total events to create: ${allEvents.length}`);
  return createMultipleEvents(oauth2Client, allEvents);
}

// Export all tasks
export async function exportTasksToCalendar(oauth2Client: any, tasks: Task[]) {
  const events = tasks
    .filter((task) => task.status !== "completed") // Only export incomplete tasks
    .map((task) => taskToCalendarEvent(task));
  return createMultipleEvents(oauth2Client, events);
}
