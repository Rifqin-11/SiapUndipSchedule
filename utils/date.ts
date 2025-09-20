export const getCurrentDayAndDate = () => {
  const today = new Date();
  const dayIndex = today.getDay();

  // English day names
  const dayNames = [
    "Sunday", // Sunday
    "Monday", // Monday
    "Tuesday", // Tuesday
    "Wednesday", // Wednesday
    "Thursday", // Thursday
    "Friday", // Friday
    "Saturday", // Saturday
  ];

  const currentDay = dayNames[dayIndex];

  // More compatible date formatting for iOS
  let currentDate: string;
  try {
    currentDate = today.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    });
  } catch (error) {
    // Fallback for iOS Safari that might not support timezone
    console.warn(
      "Timezone not supported, using fallback date formatting",
      error
    );
    currentDate = today.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return { currentDay, currentDate };
};

// Helper function to normalize day names to English
export const normalizeDayName = (day: string | undefined | null): string => {
  // Return empty string or fallback if day is null/undefined
  if (!day || typeof day !== "string") {
    return "";
  }

  const dayMapping: Record<string, string> = {
    // Indonesian to English
    senin: "Monday",
    selasa: "Tuesday",
    rabu: "Wednesday",
    kamis: "Thursday",
    jumat: "Friday",
    sabtu: "Saturday",
    minggu: "Sunday",

    // English (normalize case)
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",

    // Common abbreviations to English
    mon: "Monday",
    tue: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    fri: "Friday",
    sat: "Saturday",
    sun: "Sunday",

    // Alternative spellings
    "jum'at": "Friday",
  };

  const normalizedKey = day.toLowerCase().trim();
  return dayMapping[normalizedKey] || day;
};

export const getWeekDates = () => {
  const today = new Date();
  const currentDayIndex = today.getDay();

  const daysSinceMonday = (currentDayIndex + 6) % 7;

  const monday = new Date(today);
  monday.setDate(today.getDate() - daysSinceMonday);

  // English day abbreviations starting from Monday
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const week = [...Array(7)].map((_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    return {
      day: days[i],
      date: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
    };
  });

  return week;
};

export const colorPairs = [
  {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    roomBg: "bg-blue-800 dark:bg-blue-700",
  },
  {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300",
    roomBg: "bg-purple-800 dark:bg-purple-700",
  },
  {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-300",
    roomBg: "bg-green-800 dark:bg-green-700",
  },
  {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-300",
    roomBg: "bg-red-800 dark:bg-red-700",
  },
  {
    bg: "bg-pink-100 dark:bg-pink-900/30",
    text: "text-pink-700 dark:text-pink-300",
    roomBg: "bg-pink-800 dark:bg-pink-700",
  },
  {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300",
    roomBg: "bg-orange-800 dark:bg-orange-700",
  },
  {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-300",
    roomBg: "bg-yellow-800 dark:bg-yellow-700",
  },
];

// Format date to local timezone-safe YYYY-MM-DD format
export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
