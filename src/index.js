// src/index.js
import { initializeSession } from './session';
import { initActivityTracking } from './activities';
import { setUserId as internalSetUserId} from './user';
import { setApiUrls, sendActivity } from './api';

//console.log('Imported setUserId:', internalSetUserId); 
(function(global) {
  try {
    // Initialize session and activity tracking
    initializeSession();
    initActivityTracking();

    // Expose global functions
    global.TrackingPlugin = {
      setUserId: function(userId) {
        //console.log('TrackingPlugin.setUserId called with:', userId);
        internalSetUserId(userId);
      },
      trackCustomActivity: function(activityType, typeId, additionalData) {
        if (activityType.trim() === '') {
          console.error('Invalid activityType provided to trackCustomActivity.');
          return;
        }
        sendActivity(activityType, additionalData, typeId);
      },
      config: function(options) {
        if (options.apiUrl) {
          setApiUrls(options.apiUrl);
          //console.log('API URLs configured:', options.apiUrl);
        }
        // Handle other configurations
      }
    };

   // console.log('TrackingPlugin initialized:', global.TrackingPlugin);
  } catch (error) {
    console.error('Error initializing TrackingPlugin:', error);
  }
})(window);
