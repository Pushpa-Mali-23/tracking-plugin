// src/events.js
import { sendActivity } from './api';
import { getCssSelector } from './utils';

export function initEventListeners() {
  // Clicks
  document.addEventListener('click', function(event) {
    const target = event.target.closest('a, button, input, select, textarea');
    if (target) {
      console.log("updateddd add event listener");
      // Determine if the target is a link (anchor) or a button with a redirection action
      const isLink = target.tagName.toLowerCase() === 'a' && target.href;
      const isButtonRedirect = target.tagName.toLowerCase() === 'button';
      let redirectUrl = null;

      if (isLink) {
        // Capture the href value for anchors
        redirectUrl = target.href;
      } else if (isButtonRedirect) {
        // If it's a button, check if its click event triggers a navigation
        const originalLocation = window.location.href;

        // Add a temporary click event listener to detect the redirection
        const checkRedirect = function() {
          const newLocation = window.location.href;
          if (newLocation !== originalLocation) {
            redirectUrl = newLocation;
          }
          window.removeEventListener('click', checkRedirect);
        };

        window.addEventListener('click', checkRedirect);
      }
      console.log(redirectUrl,"<<<<<<<<<<<<<<<<<<<<<<<<<<redirectUrl2");
      sendActivity('click', {
        activity_data: {
          tag: target.tagName.toLowerCase(),
          id: target.id || null,
          classes: target.className || null,
          text: target.innerText || null,
          x: event.clientX,
          y: event.clientY,
          selector: getCssSelector(target),
          test:"key",
          redirect_url: redirectUrl
        },
        page_url: window.location.href,
        type: 'click',
        type_id: null // Define if applicable
      });
    }
  });

  // // Form Submissions
  // document.addEventListener('submit', function(event) {
  //   const form = event.target;
  //   sendActivity('form_submit', {
  //     activity_data: {
  //       id: form.id || null,
  //       classes: form.className || null,
  //       action: form.action || null,
  //       method: form.method || null,
  //       selector: getCssSelector(form)
  //     },
  //     page_url: window.location.href,
  //     type: 'form_submit',
  //     type_id: null // Define if applicable
  //   });
  // });

  // // Scroll Depth
  // let lastScroll = 0;
  // window.addEventListener('scroll', function() {
  //   const scrollTop = window.scrollY;
  //   const docHeight = document.body.offsetHeight;
  //   const winHeight = window.innerHeight;
  //   const scrollPercent = (scrollTop) / (docHeight - winHeight) * 100;
  //   if (scrollPercent - lastScroll >= 10) { // Every 10%
  //     lastScroll = scrollPercent;
  //     sendActivity('scroll_depth', { 
  //       activity_data: { percentage: Math.floor(scrollPercent) },
  //       page_url: window.location.href,
  //       type: 'scroll_depth',
  //       type_id: null 
  //     });
  //   }
  // });

  // // Page Visibility
  // document.addEventListener('visibilitychange', function() {
  //   if (document.visibilityState === 'hidden') {
  //     sendActivity('page_hidden', { 
  //       activity_data: { },
  //       page_url: window.location.href,
  //       type: 'page_hidden',
  //       type_id: null 
  //     });
  //   } else if (document.visibilityState === 'visible') {
  //     sendActivity('page_visible', { 
  //       activity_data: { },
  //       page_url: window.location.href,
  //       type: 'page_visible',
  //       type_id: null 
  //     });
  //   }
  // });

  // Add more event listeners as needed
}
