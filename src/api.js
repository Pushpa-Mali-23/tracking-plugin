import { getUserId } from "./user";

let SESSION_API_URL = "https://your-api-domain.com/api/session";
let ACTIVITY_API_URL = "https://your-api-domain.com/api/activity";
let END_SESSION_API_URL = "https://your-api-domain.com/api/session/end"; // New End Session API
let WIDGET_ID = "NRGovRsL7oD3y/aW7VF5pQ==";
export function setApiUrls(urls) {
  if (urls?.sessionUrl) {
    SESSION_API_URL = urls.sessionUrl;
  }
  if (urls?.activityUrl) {
    ACTIVITY_API_URL = urls.activityUrl;
  }
  if (urls?.endSessionUrl) {
    END_SESSION_API_URL = urls.endSessionUrl;
  }
}

export function sendSession(data) {
  const payload = {
    contact_id: getUserId(), // Assuming user_id corresponds to contact_id
    ip_address: data.ip_address || null,
    coordinates: data.coordinates || null,
    city: data.city || null,
    state: data.state || null,
    country: data.country || null,
    user_agent: navigator.userAgent,
    session_start: data.session_start || new Date().toISOString(),
    session_end: data.session_end || null,
    time_spent: data.time_spent || null,
    channel: data.channel || null,
    referrer: data.referrer || document.referrer,
  };

  fetch(SESSION_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": navigator.userAgent,
      "x-api-key": WIDGET_ID,
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      // Optionally handle response data, such as storing session_id
      if (data?.data?.id) {
        // Store session_id in localStorage or cookies
        setSessionId(data.data.id);
      }
    })
    .catch((err) => console.error("Session tracking failed:", err));
}

export function sendEndSession(sessionId, sessionEnd = null) {
  const payload = {
    session_id: sessionId,
    session_end: sessionEnd
      ? new Date(sessionEnd).toISOString()
      : new Date().toISOString(),
  };

  fetch(END_SESSION_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": navigator.userAgent,
      "x-api-key": WIDGET_ID,
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Session ended successfully:", data);
      // Optionally, clear the session_id from storage
      clearSessionId();
    })
    .catch((err) => console.error("End session tracking failed:", err));
}

export function sendActivity(activityType, typeId = null, additionalData = {}) {
    const payload = {
      session_id: getSessionId(),
      activity_data: {
        activity_type: activityType,
        ...additionalData
      },
      page_url: additionalData?.page_url || window.location.href,
      type: activityType, // Assuming 'type' corresponds to 'activityType'
      type_id: typeId,
    };
  
    // Use navigator.sendBeacon for better performance on unload
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(ACTIVITY_API_URL, blob);
    } else {
      fetch(ACTIVITY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "x-api-key": WIDGET_ID,
        },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(err => console.error('Activity tracking failed:', err));
    }
  }

// Utility functions to manage session_id
export function setSessionId(id) {
  const storageKey = "session_id";
  setCookie(storageKey, id, 30); // Expires in 30 minutes
  localStorage.setItem(storageKey, id);
}

function clearSessionId() {
  const storageKey = "session_id";
  setCookie(storageKey, "", -1); // Expire the cookie
  localStorage.removeItem(storageKey);
}

function setCookie(name, value, minutes) {
  const expires = new Date(Date.now() + minutes * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/`;
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2)
    return decodeURIComponent(parts.pop().split(";").shift());
}

export function getSessionId() {
  return getCookie("session_id");
}

// export function setSessionId(id) {
//   setCookie("session_id", id, SESSION_TIMEOUT / 1000 / 60); // Convert ms to minutes
// }
