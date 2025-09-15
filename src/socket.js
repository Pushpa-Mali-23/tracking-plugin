import { io } from "socket.io-client";
import { getCookie, initializeSession, setCookie, tenant_id } from "./session";
import {
  eventTriggers,
  fetchTriggers,
  getEventTriggers,
  getSessionId,
  getSocketId,
  getTenantId,
  sendEndSession,
  updateSocketId,
} from "./api";
import { getUserId } from "./user";
import { initActivityTracking } from "./activities";
import { connect, stripSlashes } from "./utils";

// WebSocket URL
const SOCKET_URL = "wss://api.jwero.com";
//const SOCKET_URL = "https://5850-116-72-105-227.ngrok-free.app";
//const SOCKET_URL = "https://api.jwero.com";
//const SOCKET_URL = "wss://1804-2409-4080-3e82-d5f8-e9e0-de8d-f15b-f12e.ngrok-free.app";
//const SOCKET_URL = "http://localhost:8080";

let socket = null;
if (connect) {
  // Initialize socket connection
  socket = io(SOCKET_URL, {
    transports: ["websocket"], // WebSocket transport
    reconnection: true, // Enable reconnection
    //secure: true, // Secure connection
    // pingTimeout: 45000,  // Wait 45s for pong (mobile-friendly)
    // pingInterval: 30000, // Ping every 30s (balance between battery and detection)
    // timeout: 5000,       // Fail fast on initial connection
  });

  // Log socket connection
  socket.on("connect", async () => {
    //console.log("socket connectedd");
    //console.log(SOCKET_URL);

    //   console.log(
    //     "on every page refresh new socket id will be updated in db",
    //     socket.id
    //   );
    setCookie("socket_id", socket.id, 30); // Store socket ID in a cookie for 10 minutes

    const sessionId = getCookie("session_id"); // Get session ID from cookie
    //console.log(sessionId);
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
            //socket.emit("visitor_integration",tenantId);
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
}

// Load existing session IDs from localStorage (or use an empty array if none found)
let userLoginSessions =
  JSON.parse(localStorage.getItem("userLoginSessions")) || [];

export function sendSocketActivity(
  activityType,
  additionalData = {},
  typeId = null
) {
  if (!connect || !socket) return; // Prevent function execution if socket is disabled
  const sendActivity = () => {
    const sessionId = getSessionId();
    const socketId = getSocketId();
    const tenantId = tenant_id;
    const { userId } = getUserId();

    if (!socketId || !sessionId || !tenantId) {
      setTimeout(sendActivity, 200);
      return;
    }

    // If the activityType is "user_login", check if we’ve already logged in for this session
    if (activityType === "user_login") {
      // If we already have this session ID in localStorage, skip
      if (userLoginSessions.includes(sessionId)) {
        return;
      } else {
        // Otherwise, store it
        userLoginSessions.push(sessionId);
        localStorage.setItem(
          "userLoginSessions",
          JSON.stringify(userLoginSessions)
        );
      }
    }

    const additionalActivities = [
      "add_to_cart",
      "wishlist",
      "product_view",
      "remove_from_cart",
      "remove_from_wishlist",
    ];
    let payload = {};
    if (additionalActivities.includes(activityType)) {
      payload = {
        session_id: parseInt(sessionId),
        socket_id: socketId,
        tenant_id: tenantId,
        page_url: window.location.href,
        type: activityType,
        type_id: additionalData?.slug || additionalData?.sku,
        activity_data: {
          category: "product",
          identifier: additionalData?.slug || additionalData?.sku,
          //...additionalData,
        },
      };
    } else {
      payload = {
        session_id: parseInt(sessionId),
        socket_id: socketId,
        tenant_id: tenantId,
        activity_data: {
          ...additionalData?.activity_data,
        },
        page_url: additionalData?.page_url || window.location.href,
        type:
          activityType === "product_view_plugin"
            ? "product_view"
            : activityType,
        ...(typeId || additionalData?.type_id
          ? { type_id: typeId || additionalData?.type_id }
          : {}),
      };
    }

    if (additionalData?.activity_data?.userIsLoggedIn === true) {
      // Check if the activityType is "page_view"
      if (
        activityType === "page_view" ||
        activityType === "click" ||
        activityType === "product_view"
      ) {
        const event_Triggers = eventTriggers; // Get event triggers
        const matchingTrigger = event_Triggers.find((trigger) => {
          return (
            (activityType === "page_view" && trigger.event === "page_view") ||
            (activityType === "product_view" &&
              trigger.event == "product_view") ||
            (activityType === "click" && trigger.event === "clicks")
          );
        });

        if (matchingTrigger) {
          let pageIdentifier;
          if (activityType === "click") {
            pageIdentifier = additionalData?.activity_data?.text;
          } else {
            pageIdentifier = payload.activity_data?.identifier;
          }
          const normalizedPageIdentifier = stripSlashes(pageIdentifier);
          const normalizedValues = matchingTrigger.values.map(stripSlashes);
          if (tenantId === "oAeqLavq0AQi") console.log(normalizedPageIdentifier,"<<normalizedPageIdentifier");
          if (tenantId === "oAeqLavq0AQi") console.log(normalizedValues,"<<normalizedValues");
          if (tenantId === "oAeqLavq0AQi") console.log(normalizedValues.includes(normalizedPageIdentifier),"<<normalizedPageIdentifier");
          // Check if the identifier exists in the event values for the "page_view" trigger
          if (normalizedValues.includes(normalizedPageIdentifier)) {
            const { userId } = getUserId();
            // If there's a match, trigger the event
            const trigger_payload = {
              tenant_id: tenantId,
              event_name: activityType.toUpperCase(),
              users: [
                {
                  id: parseInt(userId),
                  type: "CRM",
                },
              ],
              trigger_id: matchingTrigger?.id,
            };
            if (tenantId === "oAeqLavq0AQi") console.log(trigger_payload,"<<<<trigger payload");
            socket.emit("handleEventTrigger", trigger_payload);
            delete payload?.activity_data?.userIsLoggedIn;
          }
        }
      }
    }
    socket.emit("userActivity", payload);
  };
  sendActivity();
}
export default socket;
