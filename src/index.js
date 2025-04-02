// src/index.js
import { initializeSession } from "./session";
import { initActivityTracking } from "./activities";
import { setUserId as internalSetUserId } from "./user";
import { setApiUrls, sendActivity, fetchTriggers } from "./api";
import socket, { sendSocketActivity } from "./socket";
import {
  connect,
  fetchGeolocation,
  setWidgetId as internalSetWidgetId,
} from "./utils";

(function (global) {
  try {
    if (connect) {
      fetchGeolocation();

      socket?.on("connect", async () => {
        try {
          // Initialize session with the socket ID
          await initializeSession();

          // Fetch triggers and wait for it to complete before moving to activity tracking
          await fetchTriggers();

          // Initialize activity tracking
          initActivityTracking();
        } catch (error) {
          console.error("Error during initialization:", error);
        }
      });
    }

    // Expose global functions
    global.TrackingPlugin = {
      setUserId: function (userId) {
        //console.log('TrackingPlugin.setUserId called with:', userId);
        internalSetUserId(userId);
      },
      setWidgetId: function (widgetId) {
        internalSetWidgetId(widgetId);
      },
      trackProductEvent: function (eventName, productInfo) {
        if (typeof eventName !== "string" || eventName.trim() === "") {
          return;
        }
        if (typeof productInfo !== "object" || productInfo === null) {
          return;
        }

        const activity_type = eventName;
        const additionalData = productInfo;

        sendSocketActivity(activity_type, additionalData);
      },
      trackCustomActivity: function (activityType, typeId, additionalData) {
        if (activityType.trim() === "") {
          console.error(
            "Invalid activityType provided to trackCustomActivity."
          );
          return;
        }
        //sendActivity(activityType, additionalData, typeId);
        sendSocketActivity(activityType, additionalData, typeId);
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
