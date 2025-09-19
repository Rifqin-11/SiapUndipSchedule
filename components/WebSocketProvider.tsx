"use client";

import { useWebSocket } from "@/hooks/useWebSocket";

export default function WebSocketProvider() {
  // Initialize WebSocket connection and handlers
  useWebSocket();

  // This component doesn't render anything - it just initializes WebSocket
  return null;
}
