import { io } from "socket.io-client";

let SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "https://wpautomation.moxrathore.com";
if (typeof window !== "undefined" && window.location.hostname !== "localhost" && SOCKET_URL.includes("localhost")) {
  SOCKET_URL = "https://wpautomation.moxrathore.com";
}

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("🔌 Connected to WebSocket server");
    });

    socket.on("disconnect", () => {
      console.log("🔌 Disconnected from WebSocket server");
    });

    socket.on("connect_error", (err) => {
      console.warn("⚠️ WebSocket connection error:", err.message);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
