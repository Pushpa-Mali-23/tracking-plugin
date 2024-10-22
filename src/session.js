// src/session.js
import { getUserId } from "./user";
import {
  sendSession,
  sendEndSession,
  getSessionId,
  setSessionId,
  clearSessionId,
  clearUserId,
  updateLastActive,
  getSocketId,
  getTenantId,
} from "./api";

//const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const SESSION_TIMEOUT = 60 * 60 * 1000; // 30 minutes
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
  getTenantId().then((tenantId) => {
    tenant_id = tenantId;
  });
  let sessionId = getSessionId();
  if (!sessionId) {
    createNewSession();
  } else {
    resetSessionTimer();
    resetInactivityTimer();
    initializeIntervalActivity();
  }

  // Listen for page unload to end the session
  //window.addEventListener('beforeunload', handleSessionEnd);
}

// Function to set interval-based activity tracking (every 5 minutes)
function initializeIntervalActivity() {
  //console.log("INITIALZE INTERVAL ACTIVITY");
  // Clear existing interval if any
  if (activityInterval) clearInterval(activityInterval);

  // Set an interval to send activity every 5 minutes (300000 milliseconds)
  activityInterval = setInterval(() => {
    updateLastActive();
    resetInactivityTimer();
  }, 5 * 60 * 1000); // 5 minutes in milliseconds
}

function createNewSession() {
  //console.log("craeting new sessionnnnnnnnnnnnnnnnnnnnnnnnnnnn3")
  // Gather necessary session data
  //const user_id=getUserId();
  let socketId = getSocketId();

  const { userId, tempUserId } = getUserId();
  //console.log({userId, tempUserId}, "<<<<<<<<<<<<<<<<<<<<<<User IDS");
  //console.log(user_id,"1");
  //console.log(typeof user_id,"typeof used");
  //console.log(typeof parseInt(user_id),"typeof used");
  const contactId = userId ? parseInt(userId) : null;
  const tempId = tempUserId ? parseInt(tempUserId) : null;
  const sessionData = {
    //contact_id: parseInt(user_id),
    contact_id: contactId,
    temp_contact_id: tempId,
    ip_address: getUserIP(), // Implement getUserIP if needed
    coordinates: getUserCoordinates(), // Implement geolocation if needed
    city: getUserCity(), // Implement geolocation or use a service
    state: getUserState(),
    country: getUserCountry(),
    channel: getChannel(), // Define how to determine the channel
    referrer: document.referrer,
    session_start: new Date().toISOString(),
    socket_id: socketId,
  };
  //console.log(sessionData, "<<<<<<<<<<<<<<<<<<<<<<<<<<sessiondata");

  sendSession(sessionData);
  resetSessionTimer();

  resetInactivityTimer();
  initializeIntervalActivity();
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
    sendEndSession(sessionId);
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
