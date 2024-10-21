// src/session.js
import { getUserId } from './user';
import { sendSession, sendEndSession, getSessionId, setSessionId, clearSessionId, clearUserId } from './api';

//const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const SESSION_TIMEOUT = 60 * 60 * 1000; // 30 minutes

let sessionTimer = null;

export function initializeSession() {
  console.log("<<<<<<<<<<<<<<<<before unload event added");
  let sessionId = getSessionId();
  if (!sessionId) {
    createNewSession();
  } else {
    resetSessionTimer();
  }

  // Listen for page unload to end the session
  window.addEventListener('beforeunload', handleSessionEnd);
}

function createNewSession() {
  //console.log("craeting new sessionnnnnnnnnnnnnnnnnnnnnnnnnnnn3")
  // Gather necessary session data
  //const user_id=getUserId();

  const {userId, tempUserId} = getUserId();
  //console.log({userId, tempUserId}, "<<<<<<<<<<<<<<<<<<<<<<User IDS");
  //console.log(user_id,"1");
  //console.log(typeof user_id,"typeof used");
  //console.log(typeof parseInt(user_id),"typeof used");
  const contactId = userId ? parseInt(userId) : null; 
  const tempId = tempUserId ? parseInt(tempUserId) : null; 
  const sessionData = {
    //contact_id: parseInt(user_id),
    contact_id: contactId,
    temp_contact_id : tempId,
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
  //console.log("end session");
  const sessionId = getSessionId();
  if (sessionId) {
    sendEndSession(sessionId);
  }
  clearSessionId();
  clearUserId();
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
