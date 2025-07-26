import { MongoClient } from "mongodb";

// Script untuk membersihkan dan memperbaiki data subjects yang duplikat atau tidak konsisten
async function cleanSubjects() {
  const mongoUri =
    process.env.MONGODB_URI ||
    "mongodb+srv://username:password@cluster.mongodb.net/database";
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db("schedule_undip");
    const collection = db.collection("subjects");

    console.log("🔍 Checking for duplicate or inconsistent subjects...");

    // Find all subjects
    const subjects = await collection.find({}).toArray();
    console.log(`📊 Found ${subjects.length} subjects total`);

    // Group by name, day, startTime, endTime to find duplicates
    const duplicateGroups = {};
    subjects.forEach((subject) => {
      const key = `${subject.name}-${subject.day}-${subject.startTime}-${subject.endTime}`;
      if (!duplicateGroups[key]) {
        duplicateGroups[key] = [];
      }
      duplicateGroups[key].push(subject);
    });

    let deletedCount = 0;
    let updatedCount = 0;

    for (const [key, group] of Object.entries(duplicateGroups)) {
      if (group.length > 1) {
        console.log(`🔍 Found ${group.length} duplicates for: ${key}`);

        // Keep the first one (usually the oldest), delete the rest
        const toKeep = group[0];
        const toDelete = group.slice(1);

        console.log(`  ✅ Keeping: ${toKeep._id}`);

        for (const duplicate of toDelete) {
          console.log(`  ❌ Deleting: ${duplicate._id}`);
          await collection.deleteOne({ _id: duplicate._id });
          deletedCount++;
        }

        // Update the kept subject to ensure it has proper id field
        await collection.updateOne(
          { _id: toKeep._id },
          {
            $set: {
              id: toKeep._id.toString(),
              updatedAt: new Date(),
            },
          }
        );
        updatedCount++;
      } else {
        // Single subject, just ensure it has proper id field
        const subject = group[0];
        if (!subject.id || subject.id !== subject._id.toString()) {
          await collection.updateOne(
            { _id: subject._id },
            {
              $set: {
                id: subject._id.toString(),
                updatedAt: new Date(),
              },
            }
          );
          updatedCount++;
        }
      }
    }

    console.log(`✅ Cleanup complete!`);
    console.log(`   - Deleted ${deletedCount} duplicate subjects`);
    console.log(`   - Updated ${updatedCount} subjects with proper IDs`);

    // Final count
    const finalCount = await collection.countDocuments();
    console.log(`📊 Final count: ${finalCount} subjects`);
  } catch (error) {
    console.error("❌ Error cleaning subjects:", error);
  } finally {
    await client.close();
  }
}

// Run the cleanup
cleanSubjects().catch(console.error);
