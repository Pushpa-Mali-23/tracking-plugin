import { io } from "socket.io-client";
import { getCookie, initializeSession, setCookie, tenant_id } from "./session";
import { eventTriggers, fetchTriggers, getEventTriggers, getSessionId, getSocketId, getTenantId, sendEndSession, updateSocketId } from "./api";
import { getUserId } from "./user";
import { initActivityTracking } from "./activities";

// WebSocket URL
const SOCKET_URL = "wss://api.jwero.com";
//const SOCKET_URL = "https://5850-116-72-105-227.ngrok-free.app";
//const SOCKET_URL = "https://api.jwero.com";
//const SOCKET_URL = "wss://1804-2409-4080-3e82-d5f8-e9e0-de8d-f15b-f12e.ngrok-free.app";
//const SOCKET_URL = "http://localhost:8080";

// Initialize socket connection
const socket = io(SOCKET_URL, {
  transports: ["websocket"], // WebSocket transport
  reconnection: true, // Enable reconnection
  //secure: true, // Secure connection
});

// Log socket connection
socket.on("connect", async () => {
  console.log("socket connectedd");
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
  console.log(additionalData?.activity_data,"<<<<<Additional Data 1");
  const sendActivity = () => {

  const sessionId = getSessionId();
  const socketId = getSocketId();
  const tenantId = tenant_id;
  const {userId} = getUserId();

  if(!socketId || !sessionId || !tenantId) {
    setTimeout(sendActivity, 200);
    return;
  }


  const paylaod = {
    session_id : parseInt(sessionId),
    socket_id : socketId,
    tenant_id : tenantId,
    // activity_data : {
    //   activity_type : activityType,
    //   ...additionalData,
    // },
    activity_data : {
      ...additionalData?.activity_data
    },
    page_url: additionalData?.page_url || window.location.href,
    type: activityType,
    //...(typeId ? { type_id : typeId} : {}),
    ...(typeId || additionalData?.type_id
      ? { type_id: typeId || additionalData?.type_id }
      : {}),
  };
  console.log(additionalData?.activity_data,"<<<<<Additional Data");
  if(additionalData?.activity_data?.userIsLoggedIn === true){
    // Check if the activityType is "page_view"
    if (activityType === "page_view" || activityType === "click" || activityType === "product_view") {
      const event_Triggers = eventTriggers; // Get event triggers
      //working // const matchingTrigger = eventTriggers.find(trigger => trigger.event === activityType);
      console.log(event_Triggers,"<<<<<event_Triggers");
      const matchingTrigger = event_Triggers.find(trigger => {
        return (activityType === "page_view" && trigger.event === "page_view" || activityType === "product_view" && trigger.event == "product_view") ||
               (activityType === "click" && trigger.event === "clicks");
      });
      console.log(matchingTrigger,"<<<<<matchingTrigger");
      if (matchingTrigger) {
        let pageIdentifier;
        console.log(pageIdentifier,"<<<<<pageIdentifier");
        console.log(activityType,"<<<<<activityType");
        if(activityType === "click"){
          pageIdentifier = additionalData?.activity_data?.text
        } else{
          pageIdentifier = paylaod.activity_data?.identifier;
        }
        console.log(pageIdentifier,"<<<<<pageIdentifier");

        // Check if the identifier exists in the event values for the "page_view" trigger
        if (matchingTrigger.values.includes(pageIdentifier)) {
          const {userId} = getUserId();
          // If there's a match, trigger the event
          const trigger_payload = {
            tenant_id : tenantId,
            event_name: activityType.toUpperCase(),
            users:[{
              id: parseInt(userId),
              type: "CRM",
            }],
            trigger_id: matchingTrigger?.id
          }
          console.log("<<<<<<<<<<<<<<<<<<<<<<<<sending trigger event>>>>>>>>>>>>>>>>>>>>>>>>")
          socket.emit("handleEventTrigger", trigger_payload);
          delete paylaod?.activity_data?.userIsLoggedIn;
        }
      }
    } 

    // const triggerPayload = {
    //   user_id : userId,
    //   event_name : activityType,
    // }
    // socket.emit("handleEventTrigger",triggerPayload);
    // delete paylaod?.activity_data.handleEventTrigger;
  }
  console.log("calling userActivity event");
  socket.emit("userActivity", paylaod);
};
sendActivity();
}
export default socket;
