// src/user.js
import { getSessionId, sendActivity, updateSessionUserId } from "./api";

export function getUserId() {
  let storageKey = "user_id";
  let userId = getCookie(storageKey) || localStorage.getItem(storageKey);
  let tempUserId = null;
  if (!userId) {
    //console.log("setting temp user id")
    tempUserId = generateUniqueId();
    storageKey = "temp_contact_id"
    setCookie(storageKey, tempUserId, 365); //expires in 1 year
    localStorage.setItem(storageKey, tempUserId);
  }else {
    tempUserId = getCookie("temp_contact_id") || localStorage.getItem("temp_contact_id");
  }

  //return userId;
  return {
    userId,
    tempUserId
  };
}

export async function setUserId(userId) {
  //console.log(userId,"<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<userId");
  const storageKey = "user_id";
  setCookie(storageKey, userId, 365);
  localStorage.setItem(storageKey, userId);
  // Optionally, send an event indicating user login
  // sendActivity('user_login', { 
  //   activity_data: { 
  //     user_id: userId 
  //   },
  //   page_url: window.location.href,
  //   type: 'user_login',
  //   type_id: null 
  // });

   // Retrieve the current session ID
   const sessionId = getSessionId();
  
   if (!sessionId) {
     console.error('No active session found. Cannot associate user ID.');
     return;
   }
 
   try {
     // Update the session with the user ID
     await updateSessionUserId(sessionId, userId);
     
     // Optionally, send a user login activity
     sendActivity('user_login', { 
       activity_data: { 
         user_id: userId 
       },
       page_url: window.location.href,
       type: 'user_login',
       type_id: null 
     });
     
     //console.log(`User ID ${userId} associated with session ${sessionId} successfully.`);
   } catch (error) {
     console.error(`Error associating user ID ${userId} with session ${sessionId}:`, error);
   }
}

function generateUniqueId() {
  // return "xxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
  //   const r = (Math.random() * 16) | 0,
  //     v = c === "x" ? r : (r & 0x3) | 0x8;
  //   return v.toString(16);
  // });
  return Math.floor(Math.random() * Math.pow(10, 16)); 
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
