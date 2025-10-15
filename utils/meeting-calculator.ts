/**
 * Utility functions for calculating meeting dates based on start date and day of week
 */

// Mapping hari Indonesia ke day index
const dayMapping: Record<string, number> = {
  Minggu: 0,
  Senin: 1,
  Selasa: 2,
  Rabu: 3,
  Kamis: 4,
  Jumat: 5,
  Sabtu: 6,
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

/**
 * Menghitung 14 tanggal pertemuan berdasarkan tanggal mulai dan hari kuliah
 * @param startDate - Tanggal mulai kuliah (YYYY-MM-DD format)
 * @param dayOfWeek - Hari kuliah (Senin, Selasa, dst atau Monday, Tuesday, dst)
 * @returns Array of 14 meeting dates in YYYY-MM-DD format
 */
export function calculateMeetingDates(
  startDate: string,
  dayOfWeek: string
): string[] {
  if (!startDate || !dayOfWeek) {
    throw new Error("Start date and day of week are required");
  }

  const targetDayIndex = dayMapping[dayOfWeek];
  if (targetDayIndex === undefined) {
    throw new Error(`Invalid day of week: ${dayOfWeek}`);
  }

  const start = new Date(startDate);
  if (isNaN(start.getTime())) {
    throw new Error(`Invalid start date: ${startDate}`);
  }

  const meetingDates: string[] = [];
  let currentDate = new Date(start);

  // Cari hari pertama yang sesuai dengan day of week
  while (currentDate.getDay() !== targetDayIndex) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Generate 14 pertemuan (7 sebelum UTS + 7 setelah UTS)
  for (let i = 0; i < 14; i++) {
    meetingDates.push(formatDateToString(currentDate));

    // Skip ke minggu berikutnya (7 hari)
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return meetingDates;
}

/**
 * Format Date object to YYYY-MM-DD string
 */
function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Mendapatkan pertemuan ke berapa berdasarkan tanggal tertentu
 * @param targetDate - Tanggal yang ingin dicek (YYYY-MM-DD)
 * @param meetingDates - Array tanggal pertemuan
 * @returns Meeting number (1-14) atau null jika tidak ditemukan
 */
export function getMeetingNumberByDate(
  targetDate: string,
  meetingDates: string[]
): number | null {
  const index = meetingDates.indexOf(targetDate);
  return index !== -1 ? index + 1 : null;
}

/**
 * Mengecek apakah tanggal tertentu adalah hari kuliah
 * @param targetDate - Tanggal yang ingin dicek (YYYY-MM-DD)
 * @param meetingDates - Array tanggal pertemuan
 * @returns boolean
 */
export function isClassDay(
  targetDate: string,
  meetingDates: string[]
): boolean {
  return meetingDates.includes(targetDate);
}

/**
 * Mendapatkan pertemuan berikutnya dari tanggal sekarang
 * @param meetingDates - Array tanggal pertemuan
 * @param currentDate - Tanggal sekarang (optional, default: today)
 * @returns Object dengan meeting number dan tanggal, atau null jika tidak ada
 */
export function getNextMeeting(
  meetingDates: string[],
  currentDate?: string
): { meetingNumber: number; date: string } | null {
  const today = currentDate || formatDateToString(new Date());

  for (let i = 0; i < meetingDates.length; i++) {
    if (meetingDates[i] >= today) {
      return {
        meetingNumber: i + 1,
        date: meetingDates[i],
      };
    }
  }

  return null; // Semua pertemuan sudah selesai
}

/**
 * Mendapatkan pertemuan yang sedang berlangsung hari ini
 * @param meetingDates - Array tanggal pertemuan
 * @param currentDate - Tanggal sekarang (optional, default: today)
 * @returns Object dengan meeting number dan tanggal, atau null jika tidak ada
 */
export function getTodayMeeting(
  meetingDates: string[],
  currentDate?: string
): { meetingNumber: number; date: string } | null {
  const today = currentDate || formatDateToString(new Date());
  const index = meetingDates.indexOf(today);

  if (index !== -1) {
    return {
      meetingNumber: index + 1,
      date: today,
    };
  }

  return null;
}

/**
 * Mengecek apakah semester sudah selesai (14 pertemuan sudah lewat)
 * @param meetingDates - Array tanggal pertemuan
 * @param currentDate - Tanggal sekarang (optional, default: today)
 * @returns boolean
 */
export function isSemesterFinished(
  meetingDates: string[],
  currentDate?: string
): boolean {
  if (meetingDates.length === 0) return false;

  const today = currentDate || formatDateToString(new Date());
  const lastMeeting = meetingDates[meetingDates.length - 1];

  return today > lastMeeting;
}

/**
 * Mendapatkan statistik pertemuan
 * @param meetingDates - Array tanggal pertemuan
 * @param attendanceDates - Array tanggal kehadiran
 * @param currentDate - Tanggal sekarang (optional, default: today)
 */
export function getMeetingStats(
  meetingDates: string[],
  attendanceDates: string[] = [],
  currentDate?: string
) {
  const today = currentDate || formatDateToString(new Date());

  // Pertemuan yang sudah berlalu
  const passedMeetings = meetingDates.filter((date) => date < today);

  // Kehadiran dari pertemuan yang sudah berlalu
  const attendedMeetings = attendanceDates.filter((date) =>
    passedMeetings.includes(date)
  );

  // Pertemuan hari ini
  const todayMeeting = getTodayMeeting(meetingDates, currentDate);

  // Pertemuan yang akan datang
  const upcomingMeetings = meetingDates.filter((date) => date > today);

  return {
    totalMeetings: meetingDates.length,
    passedMeetings: passedMeetings.length,
    attendedMeetings: attendedMeetings.length,
    upcomingMeetings: upcomingMeetings.length,
    todayMeeting,
    attendanceRate:
      passedMeetings.length > 0
        ? Math.round((attendedMeetings.length / passedMeetings.length) * 100)
        : 0,
    isFinished: isSemesterFinished(meetingDates, currentDate),
  };
}

/**
 * Menghitung timeline mingguan berdasarkan tanggal mulai semester
 * @param startDate - Tanggal mulai semester (YYYY-MM-DD)
 * @param meetingDates - Array tanggal pertemuan
 * @param attendanceDates - Array tanggal kehadiran
 * @param currentDate - Tanggal sekarang (optional, default: today)
 */
export function getWeeklyTimeline(
  startDate: string,
  meetingDates: string[] = [],
  attendanceDates: string[] = [],
  currentDate?: string
) {
  const today = currentDate || formatDateToString(new Date());
  const start = new Date(startDate);
  const current = new Date(today);

  // Calculate week number since start date
  const timeDiff = current.getTime() - start.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
  const currentWeek = Math.floor(daysDiff / 7) + 1;

  // Calculate total weeks needed based on latest meeting date
  let totalWeeksNeeded = 14; // Default to 14 weeks
  if (meetingDates.length > 0) {
    const lastMeetingDate = new Date(meetingDates[meetingDates.length - 1]);
    const weeksDiff = Math.floor(
      (lastMeetingDate.getTime() - start.getTime()) / (1000 * 3600 * 24 * 7)
    );
    totalWeeksNeeded = Math.max(weeksDiff + 1, 14); // At least 14 weeks
  }

  // Generate weekly timeline up to current week or total weeks needed
  const maxWeeks = Math.max(currentWeek, totalWeeksNeeded);
  const timeline = [];

  for (let week = 1; week <= maxWeeks; week++) {
    // Calculate the date for this week (start of week)
    const weekStartDate = new Date(start);
    weekStartDate.setDate(start.getDate() + (week - 1) * 7);
    const weekStartString = formatDateToString(weekStartDate);

    // Calculate the end of week
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
    const weekEndString = formatDateToString(weekEndDate);

    // Check if there's a meeting in this week
    const weekMeetings = meetingDates.filter(
      (date) => date >= weekStartString && date <= weekEndString
    );
    const weekAttendance = attendanceDates.filter(
      (date) => date >= weekStartString && date <= weekEndString
    );

    // Determine status
    let status: "attended" | "not-attended" | "upcoming" | "no-meeting";

    if (weekMeetings.length === 0) {
      status = "no-meeting";
    } else if (weekEndString < today) {
      // Week has passed
      status = weekAttendance.length > 0 ? "attended" : "not-attended";
    } else if (weekStartString <= today && today <= weekEndString) {
      // Current week
      status = weekAttendance.length > 0 ? "attended" : "not-attended";
    } else {
      // Future week
      status = "upcoming";
    }

    timeline.push({
      week,
      startDate: weekStartString,
      endDate: weekEndString,
      meetings: weekMeetings,
      attendance: weekAttendance,
      status,
      isCurrentWeek: weekStartString <= today && today <= weekEndString,
      isFuture: weekStartString > today,
    });
  }

  return {
    currentWeek: Math.max(currentWeek, 1),
    totalWeeks: maxWeeks,
    timeline,
    overallStats: {
      totalMeetings: meetingDates.length,
      totalAttended: attendanceDates.length,
      attendanceRate:
        meetingDates.length > 0
          ? Math.round((attendanceDates.length / meetingDates.length) * 100)
          : 0,
    },
  };
}
