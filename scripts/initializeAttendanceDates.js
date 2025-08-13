// Script to initialize attendanceDates field for existing subjects
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = "schedule_undip";

async function initializeAttendanceDates() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const collection = db.collection("subjects");

    // Find subjects that don't have attendanceDates field
    const subjectsWithoutAttendanceDates = await collection
      .find({
        attendanceDates: { $exists: false },
      })
      .toArray();

    console.log(
      `Found ${subjectsWithoutAttendanceDates.length} subjects without attendanceDates field`
    );

    // Update each subject to add empty attendanceDates array
    const updateResult = await collection.updateMany(
      { attendanceDates: { $exists: false } },
      { $set: { attendanceDates: [] } }
    );

    console.log(
      `Updated ${updateResult.modifiedCount} subjects with empty attendanceDates array`
    );
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
    console.log("Connection closed");
  }
}

initializeAttendanceDates();
