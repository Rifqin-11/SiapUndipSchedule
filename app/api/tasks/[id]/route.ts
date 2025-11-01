import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyJWTToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

// PUT /api/tasks/[id] - Update a task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      priority,
      status,
      dueDate,
      dueTime,
      submissionLink,
      subjectId,
      category,
    } = body;

    // Validate required fields only if they are provided
    if (title !== undefined && (!title || title.trim() === "")) {
      return NextResponse.json(
        { success: false, error: "Title cannot be empty" },
        { status: 400 }
      );
    }

    if (dueDate !== undefined && (!dueDate || dueDate.trim() === "")) {
      return NextResponse.json(
        { success: false, error: "Due date cannot be empty" },
        { status: 400 }
      );
    }

    // Validate subjectId if provided
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

    // Build update data with only provided fields
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined)
      updateData.description = description?.trim() || "";
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (dueTime !== undefined) updateData.dueTime = dueTime;
    if (submissionLink !== undefined)
      updateData.submissionLink = submissionLink?.trim() || "";
    if (category !== undefined) updateData.category = category?.trim() || null;
    if (subjectId !== undefined)
      updateData.subjectId =
        subjectId && subjectId.trim() !== "" ? subjectId : null;

    // Update task
    let result;
    try {
      // First try as MongoDB ObjectId (most common case)
      if (/^[0-9a-fA-F]{24}$/.test(params.id)) {
        console.log(`Trying to update task with ObjectId: ${params.id}`);
        result = await db
          .collection("tasks")
          .updateOne(
            { _id: new ObjectId(params.id), userId: decoded.userId },
            { $set: updateData }
          );
      } else {
        // Try as custom id field
        console.log(`Trying to update task with custom id: ${params.id}`);
        result = await db
          .collection("tasks")
          .updateOne(
            { id: params.id, userId: decoded.userId },
            { $set: updateData }
          );
      }
    } catch (error) {
      console.log(`ObjectId failed, trying custom id for: ${params.id}`, error);
      // Fallback: try as custom id field
      result = await db
        .collection("tasks")
        .updateOne(
          { id: params.id, userId: decoded.userId },
          { $set: updateData }
        );
    }

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    // Get updated task with subject info
    let updatedTask;
    try {
      // First try as MongoDB ObjectId
      if (/^[0-9a-fA-F]{24}$/.test(params.id)) {
        updatedTask = await db
          .collection("tasks")
          .findOne({ _id: new ObjectId(params.id) });
      } else {
        // Try as custom id field
        updatedTask = await db.collection("tasks").findOne({ id: params.id });
      }
    } catch {
      // Fallback: try as custom id field
      updatedTask = await db.collection("tasks").findOne({ id: params.id });
    }

    let subject = null;
    if (updatedTask?.subjectId) {
      let searchQuery;
      try {
        // Check if it's a valid ObjectId format (24 character hex string)
        if (/^[0-9a-fA-F]{24}$/.test(updatedTask.subjectId)) {
          searchQuery = {
            $or: [
              {
                _id: new ObjectId(updatedTask.subjectId),
                userId: decoded.userId,
              },
              { _id: updatedTask.subjectId, userId: decoded.userId },
              { id: updatedTask.subjectId, userId: decoded.userId },
            ],
          };
        } else {
          searchQuery = {
            $or: [{ id: updatedTask.subjectId, userId: decoded.userId }],
          };
        }
      } catch {
        // Fallback if ObjectId conversion fails
        searchQuery = {
          $or: [
            { id: updatedTask.subjectId, userId: decoded.userId },
            { _id: updatedTask.subjectId, userId: decoded.userId },
          ],
        };
      }

      const subjectDoc = await db.collection("subjects").findOne(searchQuery);

      if (subjectDoc) {
        subject = {
          id: subjectDoc.id || subjectDoc._id.toString(),
          name: subjectDoc.name,
          lecturer: subjectDoc.lecturer,
        };
      }
    }

    const taskResponse = {
      ...updatedTask,
      id: updatedTask?._id.toString(), // Use MongoDB _id as primary ID
      _id: updatedTask?._id.toString(), // Keep _id for consistency
      subject,
    };

    const response = NextResponse.json({ success: true, data: taskResponse });

    // Tambahkan no-cache headers untuk mutations
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Try to delete using both _id and custom id field
    let result;
    try {
      // First try as MongoDB ObjectId (most common case)
      if (/^[0-9a-fA-F]{24}$/.test(params.id)) {
        console.log(`Trying to delete task with ObjectId: ${params.id}`);
        result = await db
          .collection("tasks")
          .deleteOne({ _id: new ObjectId(params.id), userId: decoded.userId });
      } else {
        // Try as custom id field
        console.log(`Trying to delete task with custom id: ${params.id}`);
        result = await db
          .collection("tasks")
          .deleteOne({ id: params.id, userId: decoded.userId });
      }
    } catch (error) {
      console.log(`ObjectId failed, trying custom id for: ${params.id}`);
      // Fallback: try as custom id field
      result = await db
        .collection("tasks")
        .deleteOne({ id: params.id, userId: decoded.userId });
    }

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });

    // Tambahkan no-cache headers untuk mutations
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
