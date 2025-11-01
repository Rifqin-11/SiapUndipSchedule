// Define the 'subject' type if not imported from elsewhere
export type subject = {
  id: string;
  name: string;
  room: string;
  day: string;
  startTime: string;
  endTime: string;
  lecturer: string[];
  meeting: number;
  category?: string;
};

export const dummySubject: subject[] = [
  {
    id: "1",
    name: "Kriptografi",
    room: "B. 306",
    day: "Monday",
    startTime: "10:00",
    endTime: "12:10",
    lecturer: ["Ir. M. Arfan, S.Kom., M.Eng.", "Eko Handoyo, S.T., M.T."],
    meeting: 8,
    category: "High",
  },
  {
    id: "2",
    name: "Keamanan Jaringan",
    room: "B. 206",
    day: "Tuesday",
    startTime: "07:30",
    endTime: "09:10",
    lecturer: [
      "Ir. M. Arfan, S.Kom., M.Eng.",
      "Ir. Yosua Alvin Adi Soetrisno, S.T., M.Eng., IPM",
    ],
    meeting: 7,
  },
  {
    id: "3",
    name: "Prak. Rekayasa Perangkat Lunak",
    room: "Lab Kom",
    day: "Tuesday",
    startTime: "12:40",
    endTime: "15:30",
    lecturer: [
      "Dr. Maman Somantri, S.T., M.T.",
      "Ir. M. Arfan, S.Kom., M.Eng.",
    ],
    meeting: 3,
    category: "High",
  },
  {
    id: "4",
    name: "Prak. Jaringan Komputer",
    room: "Lab Kom",
    day: "Wednesday",
    startTime: "15:30",
    endTime: "18:21",
    lecturer: [
      "Ir. Yosua Alvin Adi Soetrisno, S.T., M.Eng., IPM",
      "Ir. M. Arfan, S.Kom., M.Eng.",
    ],
    meeting: 6,
  },
  {
    id: "5",
    name: "Jaringan Komputer",
    room: "Lab Kom",
    day: "Thursday",
    startTime: "13:00",
    endTime: "14:30",
    lecturer: ["Ir. Yosua Alvin Adi Soetrisno, S.T., M.Eng., IPM"],
    meeting: 7,
  },
  {
    id: "6",
    name: "Big Data Analytic",
    room: "B. 203",
    day: "Thursday",
    startTime: "15:31",
    endTime: "17:11",
    lecturer: [
      "Ir. Yosua Alvin Adi Soetrisno, S.T., M.Eng., IPM",
      "Eko Handoyo, S.T., M.T.",
    ],
    meeting: 6,
  },
  {
    id: "7",
    name: "Manajemen Ekonomi Teknik",
    room: "B. 305",
    day: "Friday",
    startTime: "07:30",
    endTime: "09:10",
    lecturer: ["Dr. Ir. Jaka Windarta, M.T., IPU, ASEAN Eng."],
    meeting: 7,
  },
  {
    id: "8",
    name: "Komputasi Cerdas",
    room: "B. 201",
    day: "Friday",
    startTime: "09:30",
    endTime: "12:11",
    lecturer: ["Ir. Yosua Alvin Adi Soetrisno, S.T., M.Eng., IPM"],
    meeting: 7,
  },
  {
    id: "9",
    name: "Metoda Pemrograman Modern",
    room: "B. 201",
    day: "Friday",
    startTime: "13:00",
    endTime: "14:40",
    lecturer: [
      "Ir. M. Arfan, S.Kom., M.Eng.",
      "Dr. Maman Somantri, S.T., M.T.",
    ],
    meeting: 6,
  },
];
