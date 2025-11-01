import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyJWTToken } from "@/lib/auth";
import { ObjectId } from "mongodb";
import {
  createCachedResponse,
  createErrorResponse,
  checkConditionalRequest,
} from "@/lib/cache";

// GET /api/tasks - Get all tasks for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Get user from authentication
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyJWTToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("schedule_undip");

    // Get tasks for the user
    const tasks = await db
      .collection("tasks")
      .find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .toArray();

    // Populate subject information if subjectId exists
    const tasksWithSubjects = await Promise.all(
      tasks.map(async (task) => {
        if (task.subjectId) {
          const subject = await db
            .collection("subjects")
            .findOne({ id: task.subjectId, userId: decoded.userId });

          return {
            ...task,
            id: task._id.toString(), // Use MongoDB _id as primary ID
            _id: task._id.toString(), // Keep _id for consistency
            subject: subject
              ? {
                  id: subject.id,
                  name: subject.name,
                  lecturer: subject.lecturer,
                }
              : null,
          };
        }
        return {
          ...task,
          id: task._id.toString(), // Use MongoDB _id as primary ID
          _id: task._id.toString(), // Keep _id for consistency
        };
      })
    );

    const responseData = { success: true, data: tasksWithSubjects };

    // Check conditional request untuk 304 Not Modified
    const conditionalResponse = checkConditionalRequest(request, responseData);
    if (conditionalResponse) {
      return conditionalResponse;
    }

    // Tasks berubah lebih sering, gunakan SHORT cache
    return createCachedResponse(responseData, "SHORT");
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    // Get user from authentication
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyJWTToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("schedule_undip");
    const body = await request.json();

    const {
      title,
      description,
      priority = "medium",
      status = "in-progress",
      dueDate,
      dueTime,
      submissionLink,
      subjectId,
      category,
    } = body;

    // Validate required fields
    if (!title || title.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Title is required and cannot be empty" },
        { status: 400 }
      );
    }

    if (!dueDate || dueDate.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Due date is required" },
        { status: 400 }
      );
    }

    // Validate subjectId if provided (not empty string or undefined)
    if (subjectId && subjectId.trim() !== "") {
      let searchQuery;
      try {
        // Check if it's a valid ObjectId format (24 character hex string)
        if (/^[0-9a-fA-F]{24}$/.test(subjectId)) {
          searchQuery = {
            $or: [
              { _id: new ObjectId(subjectId), userId: decoded.userId },
              { _id: subjectId, userId: decoded.userId },
              { id: subjectId, userId: decoded.userId },
            ],
          };
        } else {
          searchQuery = {
            $or: [{ id: subjectId, userId: decoded.userId }],
          };
        }
      } catch {
        // Fallback if ObjectId conversion fails
        searchQuery = {
          $or: [
            { id: subjectId, userId: decoded.userId },
            { _id: subjectId, userId: decoded.userId },
          ],
        };
      }

      const subject = await db.collection("subjects").findOne(searchQuery);

      if (!subject) {
        return NextResponse.json(
          { success: false, error: "Subject not found" },
          { status: 404 }
        );
      }
    }

    // Create new task
    const taskId = `task_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const newTask = {
      id: taskId,
      userId: decoded.userId,
      title: title.trim(),
      description: description?.trim() || "",
      priority,
      status,
      category: category?.trim() || null,
      dueDate,
      dueTime: dueTime?.trim() || null,
      submissionLink: submissionLink?.trim() || null,
      subjectId: subjectId && subjectId.trim() !== "" ? subjectId : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("tasks").insertOne(newTask);

    // Get subject info if exists
    let subject = null;
    if (subjectId && subjectId.trim() !== "") {
      const subjectDoc = await db
        .collection("subjects")
        .findOne({ id: subjectId, userId: decoded.userId });

      if (subjectDoc) {
        subject = {
          id: subjectDoc.id,
          name: subjectDoc.name,
          lecturer: subjectDoc.lecturer,
        };
      }
    }

    const taskResponse = {
      ...newTask,
      id: result.insertedId.toString(), // Use MongoDB _id as primary ID
      _id: result.insertedId.toString(), // Keep _id for consistency
      subject,
    };

    const response = NextResponse.json(
      { success: true, data: taskResponse },
      { status: 201 }
    );

    // Tambahkan no-cache headers untuk mutations
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create task" },
      { status: 500 }
    );
  }
}
