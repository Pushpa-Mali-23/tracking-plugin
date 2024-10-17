// src/index.js
import { initializeSession } from './session';
import { initActivityTracking } from './activities';
import { setUserId } from './user';
import { setApiUrls, sendActivity } from './api';

(function(global) {
  const dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
  if (dnt === '1') {
    console.warn('Do Not Track enabled. Tracking is disabled.');
    return;
  }

  // Initialize session and activity tracking
  initializeSession();
  initActivityTracking();

  // Expose global functions
  global.TrackingPlugin = {
    setUserId: function(userId) {
      setUserId(userId);
    },
    trackCustomActivity: function(activityType, typeId, additionalData) {
      if (activityType.trim() === '') {
        console.error('Invalid activityType provided to trackCustomActivity.');
        return;
      }
      sendActivity(activityType, typeId, additionalData);
    },
    config: function(options) {
      if (options.apiUrl) {
        setApiUrls(options.apiUrl); // Expecting { sessionUrl: '', activityUrl: '', endSessionUrl: '' }
      }
    //   if (options.enableClickTracking !== undefined) {
    //     toggleClickTracking(options.enableClickTracking);
    //   }
      // Handle other configurations
    }
  };
})(window);
