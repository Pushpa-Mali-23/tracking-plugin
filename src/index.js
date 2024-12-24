// src/index.js
import { initializeSession } from "./session";
import { initActivityTracking } from "./activities";
import { setUserId as internalSetUserId } from "./user";
import { setApiUrls, sendActivity, fetchTriggers } from "./api";
import socket, { sendSocketActivity } from "./socket";
import { fetchGeolocation, setWidgetId as internalSetWidgetId } from "./utils";

//console.log('Imported setUserId:', internalSetUserId);
(function (global) {
  try {
    fetchGeolocation();
   
    // Initialize session and activity tracking
    // initializeSession();
    // //initActivityTracking();
    // // Wait for a short duration before calling initActivityTracking
    // setTimeout(() => {
    //   initActivityTracking();
    // }, 300); // Adjust the delay as needed (e.g., 100ms)
    // Connect the socket and wait for it to be ready
    //working
    // socket.on("connect", () => {
    //   //console.log("socket connected in gloabl");
    //   // Initialize session with the socket ID
    //   initializeSession().then(() => {
    //     //console.log("Setting activity");
        
    //     initActivityTracking();
       
    //   })
    //   .catch((error) => {
    //     console.error("Error initializing session:", error);
    //   });;

    //   // Wait for a short duration before calling initActivityTracking
    //   // setTimeout(() => {
    //   //   console.log("Setting activity");
    //   //   initActivityTracking();
    //   // }, 600); // Adjust the delay as needed (e.g., 100ms)
    // });
    //working-end

    //uncomment
    // socket.on("connect", async () => {
      
    //   try {
    //     // Initialize session with the socket ID
    //     await initializeSession();
    
    //     // Fetch triggers and wait for it to complete before moving to activity tracking
    //     //console.log("<<<<<<fetch triggers>>>>>>")
    //     await fetchTriggers();
    
    //     //console.log("<<<<<<actitvity started>>>>>>")
    //     // Initialize activity tracking
    //     initActivityTracking();
    
    //   } catch (error) {
    //     console.error("Error during initialization:", error);
    //   }
    // });
    //uncomment

    // Expose global functions
    global.TrackingPlugin = {
      setUserId: function (userId) {
        //console.log('TrackingPlugin.setUserId called with:', userId);
        internalSetUserId(userId);
      },
      setWidgetId: function (widgetId) {
        internalSetWidgetId(widgetId);
      },
      //uncomment
      // trackCustomActivity: function (activityType, typeId, additionalData) {
      //   if (activityType.trim() === "") {
      //     console.error(
      //       "Invalid activityType provided to trackCustomActivity."
      //     );
      //     return;
      //   }
      //   //sendActivity(activityType, additionalData, typeId);
      //   sendSocketActivity(activityType, additionalData, typeId);
      // },
      //uncomment
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
