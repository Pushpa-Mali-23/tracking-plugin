import { tenant_id } from "./session";
import socket from "./socket";
import { getUserId } from "./user";
import { WIDGET_ID } from "./utils";

//let SERVER_DOMAIN = "http://localhost:8080";
//let SERVER_DOMAIN = "https://jwero-api-preprod.azurewebsites.net";
let SERVER_DOMAIN = "https://api.jwero.com";
//let SERVER_DOMAIN = "https://1804-2409-4080-3e82-d5f8-e9e0-de8d-f15b-f12e.ngrok-free.app";
let SESSION_API_URL = `${SERVER_DOMAIN}/api/session`;
let ACTIVITY_API_URL = `${SERVER_DOMAIN}/api/activity`;
let END_SESSION_API_URL = `${SERVER_DOMAIN}/api/session/end`; // End Session API
//let WIDGET_ID = "N2cH/ZGTyBWNhUWfcWq7+g==";

export let eventTriggers = [];

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
  return new Promise((resolve, reject) => {
  const payload = {
    //contact_id: getUserId(), // Assuming user_id corresponds to contact_id
    tenant_id: tenant_id,
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
    //...data.contact_id && { contact_id: parseInt(getUserId()) }, // Include contact_id if it has a value
    ...(data.contact_id && { contact_id: parseInt(data.contact_id) }), // Include contact_id if it has a value
    ...(data.temp_contact_id && {
      temp_contact_id: parseInt(data.temp_contact_id),
    }),
    ...(data.session_end && { session_end: data.session_end }), // Include if it has a value
    ...(data.time_spent && { time_spent: data.time_spent }), // Include if it has a value
    ...(data.socket_id && { socket_id: data.socket_id }), // Include if it has a value
  };

  // fetch(SESSION_API_URL, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "User-Agent": navigator.userAgent,
  //     apikey: WIDGET_ID,
  //     //"Authorization": `Bearer ${TOKEN}`
  //   },
  //   body: JSON.stringify(payload),
  //   // credentials: 'include',
  // })
  //   .then((response) => response.json())
  //   .then((data) => {
  //     // Optionally handle response data, such as storing session_id
  //     if (data?.data?.id) {
  //       // Store session_id in localStorage or cookies
  //       setSessionId(data.data.id);
  //     }
  //   })
  //   .catch((err) => console.error("Session tracking failed:", err));
  //console.log(payload,"<<<<<paylaod2");
  socket.emit("createSession", payload, (response) => {
    console.log(response,"<<<<<<<<response");
    if (response.success && response.data?.id) {
      
      // Store session_id in localStorage or cookies
      setSessionId(response.data.id);
      resolve();
    } else {
      console.error("Session creation failed:", response.error || "Unknown error");
      reject(new Error(response.error || "Session creation failed"));
      //console.error("Session creation failed:", response.error || "Unknown error");
    }
  });
  });
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
      apikey: WIDGET_ID,
    },
    body: JSON.stringify(payload),
    keepalive: true,
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Session ended successfully:", data);
      // Optionally, clear the session_id from storage
      //clearSessionId();
    })
    .catch((err) => console.error("End session tracking failed:", err));
}

export function sendActivity(activityType, additionalData = {}, typeId = null) {
  const session_id = parseInt(getSessionId());
  const payload = {
    session_id: session_id,
    activity_data: {
      activity_type: activityType,
      ...additionalData,
    },
    page_url: additionalData?.page_url || window.location.href,
    type: activityType, // Assuming 'type' corresponds to 'activityType'
    //type_id: typeId || additionalData?.type_id,
    ...(typeId || additionalData?.type_id
      ? { type_id: typeId || additionalData?.type_id }
      : {}),
    //...(typeId ? { type_id: typeId } : {})
  };

  // Use navigator.sendBeacon for better performance on unload
  // if (navigator.sendBeacon) {
  //   const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  //   navigator.sendBeacon(ACTIVITY_API_URL, blob);
  // } else {
  fetch(ACTIVITY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: WIDGET_ID,
    },
    body: JSON.stringify(payload),
    keepalive: true,
    // credentials: 'include',
  }).catch((err) => console.error("Activity tracking failed:", err));
}
//}

export async function getTenantId(retryCount = 10, delay = 1000) {
  console.log(WIDGET_ID,"<<<<<<<<<<in getTenantId widget id>>>>>>>>>>")
  console.log("<<<<<<<<<<in getTenantId>>>>>>>>>>")

  // Retry if WIDGET_ID is undefined
  while (typeof WIDGET_ID === "undefined" && retryCount > 0) {
    console.warn(retryCount,"WIDGET_ID is undefined. Retrying...");
    await new Promise(resolve => setTimeout(resolve, delay));
    retryCount--;
  }

  if (typeof WIDGET_ID === "undefined") {
    throw new Error("WIDGET_ID is still undefined after retries.");
  }
  try {
    const response = await fetch(
      `${SERVER_DOMAIN}/tenant_utils/get_tenant_id`,
      {
        method: "GET",
        headers: {
          Connection: "keep-alive",
          apikey: WIDGET_ID,
          "ngrok-skip-browser-warning":"1"
        },
      }
    );
    console.log(response,"<<<<<<<<<<in getTenantId response>>>>>>>>>>")
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        return data.tenant_id;
      } else {
        throw new Error("API call was not successful.");
      }
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching tenant ID:", error);
    throw error;
  }
}

export async function fetchTriggers() {
  const {userId} = getUserId();

    try {
      const response = await fetch(`${SERVER_DOMAIN}/flow?type=trigger&page=1&per_page=100`, {
        method: 'GET',
        headers: {
          Connection: "keep-alive",
          apikey: WIDGET_ID,
          "ngrok-skip-browser-warning":"1"
        },
      });

      const data = await response.json();
      //console.log(data.data[0].meta_data,"<<<<<<<triggers data1");

      // Filter and store events with specific event_name and values data
      eventTriggers = data.data
      .filter(item => 
        ['PAGE_VIEW', 'PRODUCT_VIEW', 'CLICKS'].includes(item.event_name) && 
        item.meta_data && item.meta_data.event_values
      )
      .map(item => ({
        id: item?.id,
        event: item.event_name.toLowerCase(),
        values: Array.isArray(item.meta_data.event_values)
          ? item.meta_data.event_values.map(value => value.value) // Extract values from dropdown items
          : [item.meta_data.event_values] // Handle single text value as an array
      }));

      console.log(eventTriggers, "<<<<<<< filtered event triggers");
      //console.log(eventTriggers[0].values.length, "<<<<<<< filtered event triggers");
      //return data;
    } catch (error) {
      console.error('Failed to fetch triggers:', error);
    }
  
}

export async function getEventTriggers() {
  return eventTriggers;
}

// Utility functions to manage session_id
export function setSessionId(id) {
  //console.log("settting session id in storage");
  const storageKey = "session_id";
  setCookie(storageKey, id, 30); // Expires in 30 minutes
  localStorage.setItem(storageKey, id);
}

export function clearSessionId() {
  const storageKey = "session_id";
  setCookie(storageKey, "", -1); // Expire the cookie
  localStorage.removeItem(storageKey);
}

export function clearUserId() {
  const storageKey = "user_id";
  setCookie(storageKey, "", -1); // Expire the cookie
  localStorage.removeItem(storageKey);
}

function setCookie(name, value, minutes) {
  const expires = new Date(Date.now() + minutes * 60 * 1000).toUTCString();
  // document.cookie = `${name}=${encodeURIComponent(
  //   value
  // )}; expires=${expires}; path=/`;
  const cookieString = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/`;
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

export function getSocketId() {
  return getCookie("socket_id");
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
  //console.log("parseInt update");
  //const url = `${SERVER_DOMAIN}/api/session/${sessionId}`;

  const payload = {
    id: parseInt(sessionId),
    tenant_id: tenant_id,
    contact_id: parseInt(userId),
    user_agent: navigator.userAgent,
  };

  try {
    // const response = await fetch(url, {
    //   method: "PUT",
    //   headers: {
    //     "Content-Type": "application/json",
    //     apikey: WIDGET_ID,
    //   },
    //   body: JSON.stringify(payload),
    // });

    // if (!response.ok) {
    //   const errorText = await response.text();
    //   throw new Error(
    //     `API responded with status ${response.status}: ${errorText}`
    //   );
    // }
    socket.emit("updateSessionUserId", payload);

    //console.log(`Session ${sessionId} updated with user ID ${userId} successfully.`);
  } catch (error) {
    console.error(
      `Failed to update session ${sessionId} with user ID ${userId}:`,
      error
    );
    throw error; // Re-throw the error to handle it in the calling function if needed
  }
}

// // Function to send activity to the server
// export async function updateLastActive() {
//   const sessionId = getSessionId();
//   if (!sessionId) return;

//   try {
//     await fetch(`${SERVER_DOMAIN}/api/session/last_active`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         apikey: WIDGET_ID,
//       },
//       body: JSON.stringify({ session_id: sessionId }),
//       keepalive: true, // Ensures the request is sent even during unload
//     });
//     // console.log(`Activity sent for session: ${sessionId}`);
//   } catch (err) {
//     console.error("Activity tracking failed:", err);
//   }
// }

export async function updateSocketId(sessionId, socketId) {
  const url = `${SERVER_DOMAIN}/api/session/${sessionId}`;

  const payload = {
    id: parseInt(sessionId),
    socket_id: socketId,
    session_end: "",
    time_spent: "",
  };

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        apikey: WIDGET_ID,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API responded with status ${response.status}: ${errorText}`
      );
    }
  } catch (error) {
    console.error(
      `Failed to update session ${sessionId} with user ID ${userId}:`,
      error
    );
    throw error; // Re-throw the error to handle it in the calling function if needed
  }
}
