import connectDB from "@/lib/mongodb";
import Subject from "@/models/Subject";
import { dummySubject } from "@/constants";

async function seedDatabase() {
  try {
    await connectDB();

    // Clear existing data
    await Subject.deleteMany({});
    console.log("Cleared existing subjects");

    // Insert dummy data
    await Subject.insertMany(dummySubject);
    console.log("Successfully seeded database with dummy data");

    // List all subjects to verify
    const subjects = await Subject.find({});
    console.log(`Total subjects in database: ${subjects.length}`);
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

export default seedDatabase;
