// WebSocket integration for real-time updates
// Handles real-time synchronization of schedule changes, tasks, and notifications

export interface WebSocketMessage {
  type:
    | "schedule_update"
    | "task_update"
    | "task_create"
    | "task_delete"
    | "notification"
    | "subject_update"
    | "subject_create"
    | "subject_delete"
    | "attendance_update";
  data: any;
  userId?: string;
  timestamp: number;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  enabled?: boolean; // Optional flag to enable/disable WebSocket
}

export interface WebSocketEventHandlers {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onScheduleUpdate?: (data: any) => void;
  onTaskUpdate?: (data: any) => void;
  onTaskCreate?: (data: any) => void;
  onTaskDelete?: (data: any) => void;
  onSubjectUpdate?: (data: any) => void;
  onSubjectCreate?: (data: any) => void;
  onSubjectDelete?: (data: any) => void;
  onNotification?: (data: any) => void;
  onAttendanceUpdate?: (data: any) => void;
}

class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private handlers: WebSocketEventHandlers = {};
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private isAuthenticated = false;
  private userId: string | null = null;

  constructor(config: WebSocketConfig) {
    this.config = config;
  }

  /**
   * Initialize WebSocket connection
   */
  public async connect(userId: string, authToken: string): Promise<void> {
    if (
      this.isConnecting ||
      (this.ws && this.ws.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    // In development, disable WebSocket if no server is available
    if (process.env.NODE_ENV === "development" && !this.config.enabled) {
      console.log("[WebSocket] Disabled in development mode");
      return;
    }

    this.isConnecting = true;
    this.userId = userId;

    try {
      // Create WebSocket connection with auth token
      const wsUrl = `${this.config.url}?token=${authToken}&userId=${userId}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
    } catch (error) {
      console.error("[WebSocket] Connection failed:", error);
      this.isConnecting = false;

      // In development, don't retry if server is not available
      if (process.env.NODE_ENV === "development") {
        console.log("[WebSocket] Skipping reconnect in development mode");
        return;
      }

      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect WebSocket
   */
  public disconnect(): void {
    this.clearTimers();
    this.reconnectAttempts = 0;
    this.isAuthenticated = false;

    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }
  }

  /**
   * Send message through WebSocket
   */
  public send(message: Omit<WebSocketMessage, "timestamp">): void {
    if (
      this.ws &&
      this.ws.readyState === WebSocket.OPEN &&
      this.isAuthenticated
    ) {
      const fullMessage: WebSocketMessage = {
        ...message,
        userId: this.userId || undefined,
        timestamp: Date.now(),
      };

      this.ws.send(JSON.stringify(fullMessage));
    } else {
      console.warn(
        "[WebSocket] Cannot send message - not connected or not authenticated"
      );
    }
  }

  /**
   * Set event handlers
   */
  public setHandlers(handlers: WebSocketEventHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * Get connection status
   */
  public getStatus(): {
    isConnected: boolean;
    isAuthenticated: boolean;
    readyState: number | null;
  } {
    return {
      isConnected: this.ws?.readyState === WebSocket.OPEN || false,
      isAuthenticated: this.isAuthenticated,
      readyState: this.ws?.readyState || null,
    };
  }

  // Private methods

  private handleOpen(): void {
    console.log("[WebSocket] Connected successfully");
    this.isConnecting = false;
    this.reconnectAttempts = 0;

    // Send authentication message
    this.send({
      type: "notification", // Using existing type for auth
      data: { action: "authenticate", userId: this.userId },
    });

    this.startHeartbeat();
    this.handlers.onConnect?.();
  }

  private handleClose(event: CloseEvent): void {
    this.isConnecting = false;
    this.isAuthenticated = false;
    this.clearTimers();

    // Only log if not in development mode or if it's an unexpected disconnect
    if (process.env.NODE_ENV !== "development" || event.code !== 1006) {
      console.log("[WebSocket] Disconnected:", event.code, event.reason);
    }

    this.handlers.onDisconnect?.();

    // Don't attempt to reconnect in development if connection failed
    if (
      event.code !== 1000 &&
      !(process.env.NODE_ENV === "development" && event.code === 1006)
    ) {
      this.scheduleReconnect();
    }
  }

  private handleError(event: Event): void {
    this.isConnecting = false;

    // Only log errors in production or if WebSocket should be available
    if (process.env.NODE_ENV !== "development") {
      console.error("[WebSocket] Error:", event);
    }

    this.handlers.onError?.(event);
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);

      // Handle authentication response
      if (
        message.type === "notification" &&
        message.data?.action === "authenticated"
      ) {
        this.isAuthenticated = true;
        console.log("[WebSocket] Authenticated successfully");
        return;
      }

      // Only process messages if authenticated
      if (!this.isAuthenticated) {
        return;
      }

      // Call general message handler
      this.handlers.onMessage?.(message);

      // Call specific handlers based on message type
      switch (message.type) {
        case "schedule_update":
          this.handlers.onScheduleUpdate?.(message.data);
          break;
        case "task_update":
          this.handlers.onTaskUpdate?.(message.data);
          break;
        case "task_create":
          this.handlers.onTaskCreate?.(message.data);
          break;
        case "task_delete":
          this.handlers.onTaskDelete?.(message.data);
          break;
        case "subject_update":
          this.handlers.onSubjectUpdate?.(message.data);
          break;
        case "subject_create":
          this.handlers.onSubjectCreate?.(message.data);
          break;
        case "subject_delete":
          this.handlers.onSubjectDelete?.(message.data);
          break;
        case "notification":
          this.handlers.onNotification?.(message.data);
          break;
        case "attendance_update":
          this.handlers.onAttendanceUpdate?.(message.data);
          break;
        default:
          console.warn("[WebSocket] Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("[WebSocket] Failed to parse message:", error);
    }
  }

  private scheduleReconnect(): void {
    // Don't reconnect in development mode
    if (process.env.NODE_ENV === "development") {
      return;
    }

    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.log("[WebSocket] Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    console.log(
      `[WebSocket] Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`
    );

    this.reconnectTimer = setTimeout(() => {
      if (this.userId) {
        // We'd need to get the auth token again here
        // For now, we'll just try to reconnect without it
        this.connect(this.userId, ""); // In real implementation, get fresh token
      }
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping", timestamp: Date.now() }));
      }
    }, this.config.heartbeatInterval);
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

// Default configuration
const defaultConfig: WebSocketConfig = {
  url: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001",
  reconnectInterval: 1000, // 1 second
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000, // 30 seconds
  enabled: process.env.NODE_ENV !== "development", // Disable in development by default
};

// Global WebSocket manager instance
let wsManager: WebSocketManager | null = null;

/**
 * Initialize WebSocket manager
 */
export function initializeWebSocket(
  config?: Partial<WebSocketConfig>
): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager({ ...defaultConfig, ...config });
  }
  return wsManager;
}

/**
 * Get the current WebSocket manager instance
 */
export function getWebSocketManager(): WebSocketManager | null {
  return wsManager;
}

/**
 * Connect to WebSocket with authentication
 */
export async function connectWebSocket(
  userId: string,
  authToken: string
): Promise<void> {
  const manager = initializeWebSocket();
  await manager.connect(userId, authToken);
}

/**
 * Disconnect from WebSocket
 */
export function disconnectWebSocket(): void {
  wsManager?.disconnect();
}

/**
 * Send real-time update message
 */
export function sendRealtimeUpdate(
  type: WebSocketMessage["type"],
  data: any
): void {
  wsManager?.send({ type, data });
}

/**
 * Setup WebSocket event handlers
 */
export function setupWebSocketHandlers(handlers: WebSocketEventHandlers): void {
  wsManager?.setHandlers(handlers);
}
