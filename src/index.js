// src/index.js
import { initializeSession } from "./session";
import { initActivityTracking } from "./activities";
import { setUserId as internalSetUserId } from "./user";
import { setApiUrls, sendActivity } from "./api";
import socket from "./socket";
import { setWidgetId as internalSetWidgetId } from "./utils";

//console.log('Imported setUserId:', internalSetUserId);
(function (global) {
  try {
    // Initialize session and activity tracking
    // initializeSession();
    // //initActivityTracking();
    // // Wait for a short duration before calling initActivityTracking
    // setTimeout(() => {
    //   initActivityTracking();
    // }, 300); // Adjust the delay as needed (e.g., 100ms)
    // Connect the socket and wait for it to be ready
    socket.on("connect", () => {
      // Initialize session with the socket ID
      initializeSession(socket.id);

      // Wait for a short duration before calling initActivityTracking
      setTimeout(() => {
        initActivityTracking();
      }, 600); // Adjust the delay as needed (e.g., 100ms)
    });

    // Expose global functions
    global.TrackingPlugin = {
      setUserId: function (userId) {
        //console.log('TrackingPlugin.setUserId called with:', userId);
        internalSetUserId(userId);
      },
      setWidgetId: function (widgetId) {
        internalSetWidgetId(widgetId);
      },
      trackCustomActivity: function (activityType, typeId, additionalData) {
        if (activityType.trim() === "") {
          console.error(
            "Invalid activityType provided to trackCustomActivity."
          );
          return;
        }
        sendActivity(activityType, additionalData, typeId);
      },
      config: function (options) {
        if (options.apiUrl) {
          setApiUrls(options.apiUrl);
          //console.log('API URLs configured:', options.apiUrl);
        }
        // Handle other configurations
      },
    };

    // console.log('TrackingPlugin initialized:', global.TrackingPlugin);
  } catch (error) {
    console.error("Error initializing TrackingPlugin:", error);
  }
})(window);
