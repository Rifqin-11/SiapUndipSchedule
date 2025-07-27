export const getCurrentDayAndDate = () => {
  const today = new Date();
  const currentDay = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "Asia/Jakarta",
  }).format(today);

  const currentDate = today.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
  return { currentDay, currentDate };
};

// Helper function to normalize day names
export const normalizeDayName = (day: string): string => {
  const dayMapping: Record<string, string> = {
    // English to English (normalize case)
    'monday': 'Monday',
    'tuesday': 'Tuesday', 
    'wednesday': 'Wednesday',
    'thursday': 'Thursday',
    'friday': 'Friday',
    'saturday': 'Saturday',
    'sunday': 'Sunday',
    
    // Indonesian to English
    'senin': 'Monday',
    'selasa': 'Tuesday',
    'rabu': 'Wednesday', 
    'kamis': 'Thursday',
    'jumat': 'Friday',
    'sabtu': 'Saturday',
    'minggu': 'Sunday',
    
    // Common variations
    'mon': 'Monday',
    'tue': 'Tuesday',
    'wed': 'Wednesday',
    'thu': 'Thursday',
    'fri': 'Friday',
    'sat': 'Saturday',
    'sun': 'Sunday'
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
    { bg: "bg-blue-100", text: "text-blue-700", roomBg: "bg-blue-800" },
    { bg: "bg-purple-100", text: "text-purple-700", roomBg: "bg-purple-800" },
    { bg: "bg-green-100", text: "text-green-700", roomBg: "bg-green-800" },
    { bg: "bg-red-100", text: "text-red-700", roomBg: "bg-red-800" },
    { bg: "bg-pink-100", text: "text-pink-700", roomBg: "bg-pink-800" },
    { bg: "bg-orange-100", text: "text-orange-700", roomBg: "bg-orange-800" },
    { bg: "bg-yellow-100", text: "text-yellow-700", roomBg: "bg-yellow-800" },
  ];
