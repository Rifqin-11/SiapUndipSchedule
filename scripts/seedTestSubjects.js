const { MongoClient } = require("mongodb");

const uri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/schedule_siap_undip";

const testSubjects = [
  {
    name: "Pemrograman Web",
    day: "Monday",
    startTime: "08:00",
    endTime: "10:00",
    room: "Lab Komputer 1",
    lecturer: "Dr. Ahmad Rahman",
    description: "Mata kuliah pemrograman web dengan Next.js",
  },
  {
    name: "Basis Data",
    day: "Tuesday",
    startTime: "09:00",
    endTime: "11:00",
    room: "Ruang 201",
    lecturer: "Prof. Siti Nurhaliza",
    description: "Mata kuliah sistem basis data",
  },
  {
    name: "Algoritma dan Struktur Data",
    day: "Wednesday",
    startTime: "13:00",
    endTime: "15:00",
    room: "Ruang 303",
    lecturer: "Dr. Budi Santoso",
    description: "Algoritma dan struktur data lanjutan",
  },
  {
    name: "Sistem Operasi",
    day: "Thursday",
    startTime: "10:00",
    endTime: "12:00",
    room: "Lab Sistem",
    lecturer: "Dr. Linda Sari",
    description: "Konsep dan implementasi sistem operasi",
  },
  {
    name: "Jaringan Komputer",
    day: "Friday",
    startTime: "14:00",
    endTime: "16:00",
    room: "Lab Jaringan",
    lecturer: "Ir. Tono Wijaya",
    description: "Fundamental jaringan komputer",
  },
];

async function seedTestData() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("schedule_siap_undip");
    const collection = db.collection("subjects");

    // Clear existing test data
    await collection.deleteMany({});
    console.log("Cleared existing subjects");

    // Insert test subjects
    const result = await collection.insertMany(testSubjects);
    console.log(`Inserted ${result.insertedCount} test subjects`);

    // Display inserted subjects
    const insertedSubjects = await collection.find({}).toArray();
    console.log("Test subjects created:");
    insertedSubjects.forEach((subject) => {
      console.log(
        `- ${subject.name} (${subject.day} ${subject.startTime}-${subject.endTime})`
      );
    });
  } catch (error) {
    console.error("Error seeding test data:", error);
  } finally {
    await client.close();
  }
}

seedTestData();
