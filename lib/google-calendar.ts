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

  // Parse time from startTime and endTime
  const [startHour, startMinute] = subject.startTime.split(":").map(Number);
  const [endHour, endMinute] = subject.endTime.split(":").map(Number);

  const startDateTime = new Date(targetDate);
  startDateTime.setHours(startHour, startMinute, 0, 0);

  const endDateTime = new Date(targetDate);
  endDateTime.setHours(endHour, endMinute, 0, 0);

  const lecturerString = Array.isArray(subject.lecturer)
    ? subject.lecturer.join(", ")
    : subject.lecturer || "-";

  return {
    summary: subject.name,
    description: `Ruangan: ${
      subject.room
    }\nDosen: ${lecturerString}\nPertemuan: ${subject.meeting || "-"}`,
    location: subject.room,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: "Asia/Jakarta",
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: "Asia/Jakarta",
    },
    colorId: "9", // Blue color for classes
    reminders: {
      useDefault: false,
      overrides: [
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
  for (const event of events) {
    try {
      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });
      results.push({ success: true, data: response.data });
    } catch (error: any) {
      results.push({ success: false, error: error.message });
    }
  }

  return results;
}

// Create recurring event for weekly schedule
export function createRecurringEvent(
  subject: Subject,
  numberOfWeeks: number = 14
) {
  const event = subjectToCalendarEvent(subject);

  // Add recurrence rule for weekly repetition
  return {
    ...event,
    recurrence: [
      `RRULE:FREQ=WEEKLY;COUNT=${numberOfWeeks}`, // Repeat weekly for specified weeks
    ],
  };
}

// Export all subjects as recurring events
export async function exportScheduleToCalendar(
  oauth2Client: any,
  subjects: Subject[],
  numberOfWeeks: number = 14
) {
  const events = subjects.map((subject) =>
    createRecurringEvent(subject, numberOfWeeks)
  );
  return createMultipleEvents(oauth2Client, events);
}

// Export all tasks
export async function exportTasksToCalendar(oauth2Client: any, tasks: Task[]) {
  const events = tasks
    .filter((task) => task.status !== "completed") // Only export incomplete tasks
    .map((task) => taskToCalendarEvent(task));
  return createMultipleEvents(oauth2Client, events);
}
