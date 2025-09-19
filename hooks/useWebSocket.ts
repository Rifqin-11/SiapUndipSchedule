"use client";

import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  initializeWebSocket,
  connectWebSocket,
  disconnectWebSocket,
  setupWebSocketHandlers,
  type WebSocketEventHandlers,
  type WebSocketMessage,
} from "@/lib/websocket";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export function useWebSocket() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Handle real-time updates by invalidating React Query cache
  const handleScheduleUpdate = useCallback(
    (data: any) => {
      console.log("[WebSocket] Schedule update received:", data);

      // Invalidate schedule-related queries
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["schedule"] });

      // Show notification to user
      toast.info("Schedule updated", {
        description: "Your schedule has been updated by another device",
      });
    },
    [queryClient]
  );

  const handleTaskUpdate = useCallback(
    (data: any) => {
      console.log("[WebSocket] Task update received:", data);

      // Update specific task in cache
      queryClient.setQueryData(["tasks"], (oldData: any) => {
        if (!oldData) return oldData;

        return oldData.map((task: any) =>
          task.id === data.id ? { ...task, ...data } : task
        );
      });

      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      toast.info("Task updated", {
        description: `Task "${data.title}" has been updated`,
      });
    },
    [queryClient]
  );

  const handleTaskCreate = useCallback(
    (data: any) => {
      console.log("[WebSocket] Task create received:", data);

      // Add new task to cache
      queryClient.setQueryData(["tasks"], (oldData: any) => {
        if (!oldData) return [data];
        return [...oldData, data];
      });

      toast.success("New task created", {
        description: `Task "${data.title}" has been created`,
      });
    },
    [queryClient]
  );

  const handleTaskDelete = useCallback(
    (data: any) => {
      console.log("[WebSocket] Task delete received:", data);

      // Remove task from cache
      queryClient.setQueryData(["tasks"], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.filter((task: any) => task.id !== data.id);
      });

      toast.info("Task deleted", {
        description: `Task has been deleted`,
      });
    },
    [queryClient]
  );

  const handleSubjectUpdate = useCallback(
    (data: any) => {
      console.log("[WebSocket] Subject update received:", data);

      // Update specific subject in cache
      queryClient.setQueryData(["subjects"], (oldData: any) => {
        if (!oldData) return oldData;

        return oldData.map((subject: any) =>
          subject._id === data._id ? { ...subject, ...data } : subject
        );
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["schedule"] });

      toast.info("Subject updated", {
        description: `Subject "${data.name}" has been updated`,
      });
    },
    [queryClient]
  );

  const handleSubjectCreate = useCallback(
    (data: any) => {
      console.log("[WebSocket] Subject create received:", data);

      // Add new subject to cache
      queryClient.setQueryData(["subjects"], (oldData: any) => {
        if (!oldData) return [data];
        return [...oldData, data];
      });

      toast.success("New subject added", {
        description: `Subject "${data.name}" has been added`,
      });
    },
    [queryClient]
  );

  const handleSubjectDelete = useCallback(
    (data: any) => {
      console.log("[WebSocket] Subject delete received:", data);

      // Remove subject from cache
      queryClient.setQueryData(["subjects"], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.filter((subject: any) => subject._id !== data._id);
      });

      toast.info("Subject removed", {
        description: `Subject has been removed`,
      });
    },
    [queryClient]
  );

  const handleAttendanceUpdate = useCallback(
    (data: any) => {
      console.log("[WebSocket] Attendance update received:", data);

      // Invalidate attendance-related queries
      queryClient.invalidateQueries({ queryKey: ["attendance-history"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-status"] });
      queryClient.invalidateQueries({ queryKey: ["subjects"] }); // For attendance counts

      toast.info("Attendance updated", {
        description: "Attendance records have been updated",
      });
    },
    [queryClient]
  );

  const handleNotification = useCallback((data: any) => {
    console.log("[WebSocket] Notification received:", data);

    // Handle different types of notifications
    switch (data.type) {
      case "schedule_reminder":
        toast.info("Class Reminder", {
          description: data.message,
          action: {
            label: "View Schedule",
            onClick: () => (window.location.href = "/schedule"),
          },
        });
        break;
      case "task_reminder":
        toast.warning("Task Due Soon", {
          description: data.message,
          action: {
            label: "View Tasks",
            onClick: () => (window.location.href = "/tasks"),
          },
        });
        break;
      case "system_announcement":
        toast(data.title || "System Announcement", {
          description: data.message,
        });
        break;
      default:
        toast.info("Notification", {
          description: data.message || "You have a new notification",
        });
    }
  }, []);

  const handleConnect = useCallback(() => {
    console.log("[WebSocket] Connected to real-time updates");

    toast.success("Connected", {
      description: "Real-time updates are now active",
      duration: 2000,
    });
  }, []);

  const handleDisconnect = useCallback(() => {
    console.log("[WebSocket] Disconnected from real-time updates");

    toast.warning("Disconnected", {
      description: "Real-time updates are temporarily unavailable",
      duration: 2000,
    });
  }, []);

  const handleError = useCallback((error: Event) => {
    console.error("[WebSocket] Connection error:", error);

    toast.error("Connection Error", {
      description: "Unable to connect to real-time updates",
      duration: 3000,
    });
  }, []);

  // Initialize WebSocket connection when user is authenticated
  useEffect(() => {
    if (!user || typeof window === "undefined") {
      return;
    }

    const initWebSocket = async () => {
      try {
        // Initialize WebSocket manager
        initializeWebSocket();

        // Setup event handlers
        const handlers: WebSocketEventHandlers = {
          onConnect: handleConnect,
          onDisconnect: handleDisconnect,
          onError: handleError,
          onScheduleUpdate: handleScheduleUpdate,
          onTaskUpdate: handleTaskUpdate,
          onTaskCreate: handleTaskCreate,
          onTaskDelete: handleTaskDelete,
          onSubjectUpdate: handleSubjectUpdate,
          onSubjectCreate: handleSubjectCreate,
          onSubjectDelete: handleSubjectDelete,
          onAttendanceUpdate: handleAttendanceUpdate,
          onNotification: handleNotification,
        };

        setupWebSocketHandlers(handlers);

        // Connect with user credentials
        // In a real implementation, you'd get the auth token from your auth system
        const authToken =
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("auth_token="))
            ?.split("=")[1] || "";

        await connectWebSocket(user.id, authToken);
      } catch (error) {
        console.error("[WebSocket] Initialization failed:", error);
      }
    };

    initWebSocket();

    // Cleanup on unmount or user change
    return () => {
      disconnectWebSocket();
    };
  }, [
    user,
    handleConnect,
    handleDisconnect,
    handleError,
    handleScheduleUpdate,
    handleTaskUpdate,
    handleTaskCreate,
    handleTaskDelete,
    handleSubjectUpdate,
    handleSubjectCreate,
    handleSubjectDelete,
    handleAttendanceUpdate,
    handleNotification,
  ]);

  // Utility functions to send real-time updates
  const sendScheduleUpdate = useCallback((data: any) => {
    const wsManager = initializeWebSocket();
    wsManager.send({ type: "schedule_update", data });
  }, []);

  const sendTaskUpdate = useCallback((data: any) => {
    const wsManager = initializeWebSocket();
    wsManager.send({ type: "task_update", data });
  }, []);

  const sendSubjectUpdate = useCallback((data: any) => {
    const wsManager = initializeWebSocket();
    wsManager.send({ type: "subject_update", data });
  }, []);

  return {
    // Utility functions for sending updates
    sendScheduleUpdate,
    sendTaskUpdate,
    sendSubjectUpdate,

    // Connection status (you could expose this from the WebSocket manager)
    isConnected: true, // Simplified for now
  };
}
