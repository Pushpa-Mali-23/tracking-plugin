import { io } from "socket.io-client";
import { getCookie, setCookie, tenant_id } from "./session";
import { getSessionId, getSocketId, getTenantId, sendEndSession, updateSocketId } from "./api";

// WebSocket URL
const SOCKET_URL = "wss://api.jwero.com";
//const SOCKET_URL = "wss://1804-2409-4080-3e82-d5f8-e9e0-de8d-f15b-f12e.ngrok-free.app";
//const SOCKET_URL = "http://localhost:8080";

// Initialize socket connection
const socket = io(SOCKET_URL, {
  transports: ["websocket"], // WebSocket transport
  reconnection: true, // Enable reconnection
  secure: true, // Secure connection
});

// Log socket connection
socket.on("connect", async () => {
  console.log("socket connected");
  //   console.log(
  //     "on every page refresh new socket id will be updated in db",
  //     socket.id
  //   );
  setCookie("socket_id", socket.id, 30); // Store socket ID in a cookie for 10 minutes

  const sessionId = getCookie("session_id"); // Get session ID from cookie
  const socketId = socket.id;

  if (sessionId) {
    try {
      //on every page refresh new socket id will be updated in db table and session_end, time_spent in db table will be made null
      //await updateSocketId(sessionId, socketId);
      getTenantId()
      .then((tenantId) => {

        // Prepare payload
        const payload = {
          id: parseInt(sessionId),
          tenant_id: tenantId, // Use tenant_id if you're passing it into the scope, or replace with tenantId
          socket_id: socketId,
          session_end: "",
          time_spent: "",
        };

        // Emit socket event to update session with payload
        socket.emit("updateSessionUserId", payload);
      })
      .catch((error) => {
        console.error("Error retrieving tenant ID:", error);
      });
    } catch (error) {
      console.error("Error updating session user ID:", error);
    }
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
  // socket.emit("endSession", {
  //   from: "socket",
  //   sessionId,
  //   socketId: socket.id,
  //   widgetId: "your-widget-id",
  // });
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

export function sendSocketActivity(activityType, additionalData = {}, typeId=null){
  const sendActivity = () => {

  const sessionId = getSessionId();
  const socketId = getSocketId();
  const tenantId = tenant_id;

  if(!socketId || !sessionId || !tenantId) {
    setTimeout(sendActivity, 200);
    return;
  }

  const paylaod = {
    session_id : parseInt(sessionId),
    socket_id : socketId,
    tenant_id : tenantId,
    activity_data : {
      activity_type : activityType,
      ...additionalData,
    },
    page_url: additionalData?.page_url || window.location.href,
    type: activityType,
    //...(typeId ? { type_id : typeId} : {}),
    ...(typeId || additionalData?.type_id
      ? { type_id: typeId || additionalData?.type_id }
      : {}),
  };

  socket.emit("userActivity", paylaod);
};
sendActivity();
}
export default socket;
