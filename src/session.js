// src/session.js
import { getUserId } from "./user";
import {
  sendSession,
  sendEndSession,
  getSessionId,
  setSessionId,
  clearSessionId,
  clearUserId,
  getSocketId,
  getTenantId,
} from "./api";
import socket from "./socket";
import { fetchGeolocation } from "./utils";

//const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
let inactivityTimer = null;
let activityInterval = null;
export let tenant_id;
let sessionTimer = null;

// Function to reset inactivity timer
function resetInactivityTimer() {
  //console.log("TIMER RESET");
  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    handleSessionEnd();
  }, INACTIVITY_TIMEOUT);
}

export function initializeSession() {
  // Fetch the tenant ID before initializing the session
  // Return a promise to signal completion
  return new Promise((resolve, reject) => {
  getTenantId()
    .then((tenantId) => {
      tenant_id = tenantId;
      console.log(tenantId);
      // Now proceed with session initialization after tenant ID is fetched
      let sessionId = getSessionId();
      if (!sessionId) {
        //createNewSession();
        createNewSession().then(() => resolve());
      } else {
        
        resetSessionTimer();
        resetInactivityTimer();
        //initializeIntervalActivity();
      }
      resolve();
    })
    .catch((error) => {
      console.error("Error fetching tenant ID:", error);
      reject(error);
    });
  

  // Listen for page unload to end the session
  //window.addEventListener('beforeunload', handleSessionEnd);
});
}
// Function to set interval-based activity tracking (every 5 minutes)
function initializeIntervalActivity() {
  //console.log("INITIALZE INTERVAL ACTIVITY");
  // Clear existing interval if any
  if (activityInterval) clearInterval(activityInterval);

  // Set an interval to send activity every 5 minutes (300000 milliseconds)
  activityInterval = setInterval(() => {
    //updateLastActive();
    resetInactivityTimer();
  }, 5 * 60 * 1000); // 5 minutes in milliseconds
}

function createNewSession() {
  return new Promise((resolve) => {
  let socketId = getSocketId();
  console.log(socketId);
  // Retrieve geolocation data from storage
  const storedGeolocationData = JSON.parse(
    localStorage.getItem("geolocationData")
  );

  // Extract individual geolocation values from storage, provide default values if not found
  const { country_name, state, city, latitude, longitude, IPv4 } = storedGeolocationData || {};

  const { userId, tempUserId } = getUserId();
  const contactId = userId ? parseInt(userId) : null;
  const tempId = tempUserId ? parseInt(tempUserId) : null;
  const sessionData = {
    //contact_id: parseInt(user_id),
    contact_id: contactId,
    temp_contact_id: tempId,
    ip_address: IPv4, // Implement getUserIP if needed
    coordinates:  {latitude: latitude || 0, longitude: longitude || 0 }, // Implement geolocation if needed
    city: city, // Implement geolocation or use a service
    state: state,
    country: country_name,
    channel: getChannel(), // Define how to determine the channel
    referrer: document.referrer,
    session_start: new Date().toISOString(),
    socket_id: socketId,
  };

  // sendSession(sessionData);
  // resetSessionTimer();

  // resetInactivityTimer();
  //initializeIntervalActivity();
      // Send the session data
      Promise.resolve(sendSession(sessionData)).then(() => {
        resetSessionTimer();
        resetInactivityTimer();
        resolve(); // Resolve after sending session data and resetting timers
      });
    });
}

export function resetSessionTimer() {
  if (sessionTimer) clearTimeout(sessionTimer);
  sessionTimer = setTimeout(() => {
    handleSessionEnd(); // Automatically end the session after timeout
  }, SESSION_TIMEOUT);
}

function handleSessionEnd() {
  //console.log("end session");
  const sessionId = getSessionId();
  if (sessionId) {
    //sendEndSession(sessionId);
    socket.emit("endSession", {
      //from:"beforeunload",
      sessionId,
      //socketId: socket.id,
      //widgetId: "your-widget-id",
      tenantId: tenant_id,
    });
  }
  clearSessionId();
  clearUserId();
  if (inactivityTimer) clearTimeout(inactivityTimer);
}

export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2)
    return decodeURIComponent(parts.pop().split(";").shift());
}

export function setCookie(name, value, minutes) {
  const expires = new Date(Date.now() + minutes * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/`;
}

// Placeholder functions for session data
function getUserIP() {
  // Implement IP retrieval logic or use a third-party service
  return null;
}

function getUserCoordinates() {
  // Implement geolocation logic or use a third-party service
  return null;
}

function getUserCity() {
  // Implement city retrieval logic or use a third-party service
  return null;
}

function getUserState() {
  // Implement state retrieval logic or use a third-party service
  return null;
}

function getUserCountry() {
  // Implement country retrieval logic or use a third-party service
  return null;
}

function getChannel() {
  // Define how to determine the channel, e.g., 'online', 'offline'
  return "online";
}
