interface subject {
  _id?: string;
  id: string;
  name: string;
  day: string;
  room: string;
  startTime: string;
  endTime: string;
  lecturer: string[];
  meeting: number;
  category?: string;
  userId?: string;
}

interface User {
  _id?: string;
  id: string;
  name: string;
  email: string;
  avatar?: string;
  nim?: string;
  jurusan?: string;
  fakultas?: string;
  tahunMasuk?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Settings {
  _id?: string;
  userId: string;
  theme: "light" | "dark" | "system";
  notifications: boolean;
  language: string;
  timezone: string;
  createdAt?: Date;
  updatedAt?: Date;
}
