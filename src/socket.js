import { io } from "socket.io-client";
import { getCookie, setCookie, tenant_id } from "./session";
import { sendEndSession, updateSocketId } from "./api";

// WebSocket URL
const SOCKET_URL = "wss://api.jwero.com";
//const SOCKET_URL = "http://localhost:8080";

// Initialize socket connection
const socket = io(SOCKET_URL, {
  transports: ["websocket"], // WebSocket transport
  reconnection: true, // Enable reconnection
  secure: true, // Secure connection
});

// Log socket connection
socket.on("connect", async () => {
  //   console.log(
  //     "on every page refresh new socket id will be updated in db",
  //     socket.id
  //   );
  setCookie("socket_id", socket.id, 10); // Store socket ID in a cookie for 10 minutes

  const sessionId = getCookie("session_id"); // Get session ID from cookie
  const socketId = socket.id;

  if (sessionId) {
    try {
      //on every page refresh new socket id will be updated in db table and session_end, time_spent in db table will be made null
      await updateSocketId(sessionId, socketId);
    } catch (error) {
      console.error("Error updating session user ID:", error);
    }
  } else {
    console.warn("Session ID not found in cookies.");
  }
});

socket.on("connect_error", (err) => {
  console.error("WebSocket connection error:", err);
});

socket.on("disconnect", (reason) => {
  console.warn("WebSocket disconnected:", reason);
  const sessionId = getCookie("session_id"); // Get session ID from cookie
  //   if (sessionId) {
  //     sendEndSession(sessionId);
  //   } else {
  //     console.warn("Session ID not found in cookies.");
  //   }
  //   if (sessionId) {
  socket.emit("endSession", {
    from: "socket",
    sessionId,
    socketId: socket.id,
    widgetId: "your-widget-id",
  });
  //}
});

// Handle tab or window close event
window.addEventListener("beforeunload", (event) => {
  const sessionId = getCookie("session_id"); // Get session ID from cookie
  if (sessionId) {
    socket.emit("endSession", {
      //from:"beforeunload",
      sessionId,
      //socketId: socket.id,
      //widgetId: "your-widget-id",
      tenantId: tenant_id,
    });
  }
});

export default socket;
