// src/session.js
import { getUserId } from './user';
import { sendSession, sendEndSession, getSessionId, setSessionId } from './api';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

let sessionTimer = null;

export function initializeSession() {
  let sessionId = getSessionId();
  if (!sessionId) {
    createNewSession();
  } else {
    resetSessionTimer();
  }

  // Listen for page unload to end the session
  window.addEventListener('beforeunload', handleSessionEnd); // this is getting called even if page is refreshed, but then onwards same session id is used

  //  // Track if the page is being refreshed or navigated away from
  //  window.addEventListener('beforeunload', (event) => {
  //   isPageReloaded = true;
  // });

  // // Use the unload event to handle session end on close
  // window.addEventListener('unload', handleCloseEvent);
}

function handleCloseEvent() {
  if (!isPageReloaded) {
    handleSessionEnd();
  }
}

function createNewSession() {
  // Gather necessary session data
  const sessionData = {
    contact_id: getUserId(),
    ip_address: getUserIP(), // Implement getUserIP if needed
    coordinates: getUserCoordinates(), // Implement geolocation if needed
    city: getUserCity(), // Implement geolocation or use a service
    state: getUserState(),
    country: getUserCountry(),
    channel: getChannel(), // Define how to determine the channel
    referrer: document.referrer,
    session_start: new Date().toISOString(),
  };

  sendSession(sessionData);
  resetSessionTimer();
}

export function resetSessionTimer() {
  if (sessionTimer) clearTimeout(sessionTimer);
  sessionTimer = setTimeout(() => {
    handleSessionEnd(); // Automatically end the session after timeout
  }, SESSION_TIMEOUT);
}

function handleSessionEnd() {
  const sessionId = getSessionId();
  if (sessionId) {
    console.log("ending session 1>>>>>>>>>>>>>>>>>>>",sessionId);
    sendEndSession(sessionId);
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
}

function setCookie(name, value, minutes) {
  const expires = new Date(Date.now() + minutes * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
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
  return 'online';
}
