// src/user.js
import { sendActivity } from "./api";

export function getUserId() {
  const storageKey = "user_id";
  let userId = getCookie(storageKey) || localStorage.getItem(storageKey);
//   if (!userId) {
//     userId = generateUniqueId();

//     setCookie(storageKey, userId, 365); //expires in 1 year
//     localStorage.setItem(storageKey, userId);
//   }

  return userId;
}

export function setUserId(userId) {
  console.log(userId,"<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<userId");
  const storageKey = "user_id";
  setCookie(storageKey, userId, 365);
  localStorage.setItem(storageKey, userId);
  // Optionally, send an event indicating user login
  sendActivity('user_login', { 
    activity_data: { 
      user_id: userId 
    },
    page_url: window.location.href,
    type: 'user_login',
    type_id: null 
  });
}

function generateUniqueId() {
  return "xxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie =
    name +
    "=" +
    encodeURIComponent(value) +
    "; expires=" +
    expires +
    "; path=/";
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2)
    return decodeURIComponent(parts.pop().split(";").shift());
}
