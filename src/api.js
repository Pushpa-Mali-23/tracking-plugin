import { getUserId } from "./user";

let SERVER_DOMAIN = 'http://localhost:8080';
let SESSION_API_URL = `${SERVER_DOMAIN}/api/session`;
let ACTIVITY_API_URL = `${SERVER_DOMAIN}/api/activity`;
let END_SESSION_API_URL = `${SERVER_DOMAIN}/api/session/end`; // End Session API
let WIDGET_ID = "N2cH/ZGTyBWNhUWfcWq7+g==";

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
    //contact_id: getUserId(), // Assuming user_id corresponds to contact_id
    ip_address: data.ip_address || null,
    coordinates: data.coordinates || null,
    city: data.city || null,
    state: data.state || null,
    country: data.country || null,
    user_agent: navigator.userAgent,
    session_start: data.session_start || new Date().toISOString(),
    //session_end: data.session_end || null,
    //time_spent: data.time_spent || null,
    channel: data.channel || null,
    referrer: data.referrer || document.referrer,
    ...data.contact_id && { contact_id: parseInt(getUserId()) }, // Include contact_id if it has a value
    ...data.session_end && { session_end: data.session_end }, // Include if it has a value
    ...data.time_spent && { time_spent: data.time_spent }, // Include if it has a value
  };

  console.log(payload,"<<<<<<<<<<<<<<<<<<<<<<<<<<<payload");

  fetch(SESSION_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": navigator.userAgent,
      "apikey": WIDGET_ID,
      //"Authorization": `Bearer ${TOKEN}`
    },
    body: JSON.stringify(payload),
    // credentials: 'include',
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
      "apikey": WIDGET_ID,
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Session ended successfully:", data);
      // Optionally, clear the session_id from storage
      //clearSessionId();
    })
    .catch((err) => console.error("End session tracking failed:", err));
}

export function sendActivity(activityType,additionalData = {}, typeId = null ) {
  //console.log(WIDGET_ID);
  // console.log("hereeeee in send activity");
  // console.log(activityType,"<<activityType");
  // console.log(typeId,"<<typeId");
  // console.log(additionalData,"<<additionalData");
  const session_id=parseInt(getSessionId());
    const payload = {
      session_id: session_id,
      activity_data: {
        activity_type: activityType,
        ...additionalData
      },
      page_url: additionalData?.page_url || window.location.href,
      type: activityType, // Assuming 'type' corresponds to 'activityType'
      //type_id: typeId || additionalData?.type_id,
      ...(typeId || additionalData?.type_id ? { type_id: typeId || additionalData?.type_id } : {})
      //...(typeId ? { type_id: typeId } : {})
    };

   // console.log(payload);
    //console.log(typeId ,"<<<<<<<<<<<<<<<<<<<<,updated typeId");
   // console.log("========");
   // console.log(additionalData);
   // console.log("========");
    // Use navigator.sendBeacon for better performance on unload
    // if (navigator.sendBeacon) {
    //   const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    //   navigator.sendBeacon(ACTIVITY_API_URL, blob);
    // } else {
      fetch(ACTIVITY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "apikey": WIDGET_ID,
          
        },
        body: JSON.stringify(payload),
        keepalive: true,
        // credentials: 'include',
      }).catch(err => console.error('Activity tracking failed:', err));
    }
  //}

// Utility functions to manage session_id
export function setSessionId(id) {
 // console.log("settting session id in storage");
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
  // document.cookie = `${name}=${encodeURIComponent(
  //   value
  // )}; expires=${expires}; path=/`;
  const cookieString = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  //console.log(`Settinggggggggg cookie: ${cookieString}`); // Debugging log
  document.cookie = cookieString;
}

function getCookie(name) {
  //console.log("============inside getCookie============");
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  //console.log(value,"=========value========");
  //console.log(parts,"=========parts========");
  if (parts.length === 2)
    return decodeURIComponent(parts.pop().split(";").shift());
}

export function getSessionId() {
  //console.log("inside getSessionId");
 // console.log(getCookie("session_id"),"<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<session id");
  return getCookie("session_id");
}

// export function setSessionId(id) {
//   setCookie("session_id", id, SESSION_TIMEOUT / 1000 / 60); // Convert ms to minutes
// }

/**
 * Updates the session with the provided user ID.
 * @param {number|string} sessionId - The current session ID.
 * @param {number|string} userId - The user ID to associate with the session.
 * @returns {Promise<void>}
 */
export async function updateSessionUserId(sessionId, userId) {
  console.log("parseInt update");
  const url = `${SERVER_DOMAIN}/api/session/${sessionId}`;
  
  const payload = {
    id: parseInt(sessionId),
    contact_id: parseInt(userId),
    user_agent:navigator.userAgent
  };

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'apikey': WIDGET_ID
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API responded with status ${response.status}: ${errorText}`);
    }

    //console.log(`Session ${sessionId} updated with user ID ${userId} successfully.`);
  } catch (error) {
    console.error(`Failed to update session ${sessionId} with user ID ${userId}:`, error);
    throw error; // Re-throw the error to handle it in the calling function if needed
  }
}