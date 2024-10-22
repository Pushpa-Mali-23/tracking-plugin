// src/activities.js
import { sendActivity } from './api';
import { initEventListeners } from './events';
import { parseUrl } from './utils';

export function trackPageActivity() {
 
  const url = window.location.pathname; // e.g., /products/diamond-ring-100
  const { category, identifier } = parseUrl(url); // Custom parser
  sendActivity('page_view', { 
    activity_data: { 
      category, 
      identifier 
    },
    page_url: window.location.href, 
    type: category, // Assuming 'type' corresponds to 'category'
    type_id: getTypeId(category, identifier) // Implement getTypeId based on your logic
  });
}

export function initActivityTracking() {
  // Track initial page view
  trackPageActivity();

  // Track page changes in SPAs
  if (isSinglePageApplication()) {
    const pushState = history.pushState;
    history.pushState = function() {
      pushState.apply(history, arguments);
      trackPageActivity();
    };

    const replaceState = history.replaceState;
    history.replaceState = function() {
      replaceState.apply(history, arguments);
      trackPageActivity();
    };

    window.addEventListener('popstate', trackPageActivity);
  }

  // Initialize other activity trackers
  initEventListeners();
}

function isSinglePageApplication() {
  // Implement logic to detect SPA; this is a placeholder
  return false; // Assuming SPA for demonstration
}

function getTypeId(category, identifier) {
  // Implement logic to determine type_id based on category and identifier
  // For example, map 'product' to product IDs
  // This may require additional data or a mapping strategy
  return null; // Placeholder
}
