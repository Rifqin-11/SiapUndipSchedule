import { MongoClient, Db } from "mongodb";
import clientPromise from "./mongodb";

interface IndexDefinition {
  collection: string;
  indexes: {
    fields: Record<string, 1 | -1>;
    options?: {
      unique?: boolean;
      sparse?: boolean;
      background?: boolean;
      name?: string;
    };
  }[];
}

// Define all indexes for the application
const indexDefinitions: IndexDefinition[] = [
  {
    collection: "users",
    indexes: [
      {
        fields: { email: 1 },
        options: { unique: true, name: "email_unique" },
      },
      {
        fields: { nim: 1 },
        options: { sparse: true, name: "nim_sparse" },
      },
      {
        fields: { createdAt: -1 },
        options: { name: "created_desc" },
      },
    ],
  },
  {
    collection: "subjects",
    indexes: [
      {
        fields: { userId: 1 },
        options: { name: "user_subjects" },
      },
      {
        fields: { userId: 1, name: 1 },
        options: { name: "user_subject_name" },
      },
      {
        fields: { userId: 1, days: 1 },
        options: { name: "user_schedule_days" },
      },
      {
        fields: { userId: 1, createdAt: -1 },
        options: { name: "user_subjects_recent" },
      },
      {
        fields: { attendanceDates: 1 },
        options: { sparse: true, name: "attendance_dates" },
      },
      {
        fields: { category: 1 },
        options: { name: "subject_category" },
      },
    ],
  },
  {
    collection: "tasks",
    indexes: [
      {
        fields: { userId: 1 },
        options: { name: "user_tasks" },
      },
      {
        fields: { userId: 1, status: 1 },
        options: { name: "user_task_status" },
      },
      {
        fields: { userId: 1, dueDate: 1 },
        options: { name: "user_task_due" },
      },
      {
        fields: { userId: 1, priority: 1 },
        options: { name: "user_task_priority" },
      },
      {
        fields: { subject: 1 },
        options: { name: "task_subject" },
      },
      {
        fields: { createdAt: -1 },
        options: { name: "tasks_recent" },
      },
      {
        fields: { dueDate: 1, status: 1 },
        options: { name: "due_status_compound" },
      },
    ],
  },
  {
    collection: "attendance_history",
    indexes: [
      {
        fields: { userId: 1 },
        options: { name: "user_attendance" },
      },
      {
        fields: { userId: 1, attendanceDate: -1 },
        options: { name: "user_attendance_date" },
      },
      {
        fields: { subjectId: 1 },
        options: { name: "subject_attendance" },
      },
      {
        fields: { userId: 1, subjectId: 1 },
        options: { name: "user_subject_attendance" },
      },
      {
        fields: { createdAt: -1 },
        options: { name: "attendance_recent" },
      },
    ],
  },
];

// Function to create all indexes
export async function createDatabaseIndexes(): Promise<void> {
  console.log("🔄 Starting database index creation...");

  try {
    const client = await clientPromise;
    const db = client.db("schedule_undip");

    for (const collectionDef of indexDefinitions) {
      const collection = db.collection(collectionDef.collection);

      console.log(
        `📊 Creating indexes for collection: ${collectionDef.collection}`
      );

      for (const indexDef of collectionDef.indexes) {
        try {
          const result = await collection.createIndex(
            indexDef.fields,
            indexDef.options || {}
          );

          console.log(
            `  ✅ Created index: ${
              indexDef.options?.name || "unnamed"
            } -> ${result}`
          );
        } catch (error: any) {
          // Index might already exist, that's okay
          if (error.code === 85) {
            // IndexOptionsConflict
            console.log(
              `  ⚠️  Index already exists: ${
                indexDef.options?.name || "unnamed"
              }`
            );
          } else {
            console.error(
              `  ❌ Failed to create index: ${
                indexDef.options?.name || "unnamed"
              }`,
              error.message
            );
          }
        }
      }
    }

    console.log("✅ Database index creation completed");
  } catch (error) {
    console.error("❌ Error creating database indexes:", error);
    throw error;
  }
}

// Function to analyze index usage (for monitoring)
export async function analyzeIndexUsage(): Promise<any> {
  try {
    const client = await clientPromise;
    const db = client.db("schedule_undip");

    const collections = ["users", "subjects", "tasks", "attendance_history"];
    const analysis: Record<string, any> = {};

    for (const collectionName of collections) {
      const collection = db.collection(collectionName);

      // Get index stats
      const stats = await collection.aggregate([{ $indexStats: {} }]).toArray();

      analysis[collectionName] = {
        indexes: stats.map((stat) => ({
          name: stat.name,
          usageCount: stat.accesses?.ops || 0,
          lastUsed: stat.accesses?.since || null,
        })),
        totalDocuments: await collection.countDocuments(),
      };
    }

    return analysis;
  } catch (error) {
    console.error("Error analyzing index usage:", error);
    return null;
  }
}

// Function to optimize queries with proper indexing hints
export class OptimizedQueries {
  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  // Optimized user subjects query
  async getUserSubjects(
    userId: string,
    options: {
      sortBy?: "name" | "createdAt";
      limit?: number;
      category?: string;
    } = {}
  ) {
    const collection = this.db.collection("subjects");
    const { sortBy = "createdAt", limit, category } = options;

    const query: any = { userId };
    if (category) {
      query.category = category;
    }

    let cursor = collection.find(query);

    if (sortBy === "name") {
      cursor = cursor.sort({ name: 1 });
    } else {
      cursor = cursor.sort({ createdAt: -1 });
    }

    if (limit) {
      cursor = cursor.limit(limit);
    }

    return cursor.toArray();
  }

  // Optimized user tasks query with pagination
  async getUserTasks(
    userId: string,
    options: {
      status?: string;
      priority?: string;
      page?: number;
      limit?: number;
      sortBy?: "dueDate" | "createdAt" | "priority";
    } = {}
  ) {
    const collection = this.db.collection("tasks");
    const {
      status,
      priority,
      page = 1,
      limit = 20,
      sortBy = "dueDate",
    } = options;

    const query: any = { userId };
    if (status) query.status = status;
    if (priority) query.priority = priority;

    let cursor = collection.find(query);

    // Apply sorting
    switch (sortBy) {
      case "dueDate":
        cursor = cursor.sort({ dueDate: 1 });
        break;
      case "priority":
        cursor = cursor.sort({ priority: 1, dueDate: 1 });
        break;
      default:
        cursor = cursor.sort({ createdAt: -1 });
    }

    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      cursor.skip(skip).limit(limit).toArray(),
      collection.countDocuments(query),
    ]);

    return {
      results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Optimized attendance history query
  async getUserAttendanceHistory(
    userId: string,
    options: {
      subjectId?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    } = {}
  ) {
    const collection = this.db.collection("attendance_history");
    const { subjectId, startDate, endDate, limit = 100 } = options;

    const query: any = { userId };
    if (subjectId) query.subjectId = subjectId;

    if (startDate || endDate) {
      query.attendanceDate = {};
      if (startDate) query.attendanceDate.$gte = startDate;
      if (endDate) query.attendanceDate.$lte = endDate;
    }

    return collection
      .find(query)
      .sort({ attendanceDate: -1 })
      .limit(limit)
      .toArray();
  }

  // Optimized upcoming tasks query
  async getUpcomingTasks(userId: string, days: number = 7) {
    const collection = this.db.collection("tasks");
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return collection
      .find({
        userId,
        status: { $ne: "completed" },
        dueDate: { $lte: endDate.toISOString() },
      })
      .sort({ dueDate: 1, priority: 1 })
      .limit(20)
      .toArray();
  }
}

// Helper to get optimized queries instance
export async function getOptimizedQueries(): Promise<OptimizedQueries> {
  const client = await clientPromise;
  const db = client.db("schedule_undip");
  return new OptimizedQueries(db);
}
