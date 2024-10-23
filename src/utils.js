export let WIDGET_ID;

export function setWidgetId(widgetId) {
  WIDGET_ID = widgetId;
}

export function getWidgetId() {
  return WIDGET_ID;
}

export function parseUrl(url) {
  const segments = url.split("/").filter((seg) => seg);
  if (segments.length >= 2) {
    return {
      category: segments[0], // e.g., 'products'
      identifier: segments.slice(1).join("/"), // e.g., 'diamond-ring-100'
    };
  }
  return {
    category: "home",
    identifier: url,
  };
}

export function getCssSelector(element) {
  if (!(element instanceof Element)) return null;
  const path = [];
  while (element.nodeType === Node.ELEMENT_NODE) {
    let selector = element.nodeName.toLowerCase();
    if (element.id) {
      selector += `#${element.id}`;
      path.unshift(selector);
      break;
    } else {
      let sib = element,
        nth = 1;
      while ((sib = sib.previousElementSibling)) {
        if (sib.nodeName.toLowerCase() === selector) nth++;
      }
      if (nth !== 1) selector += `:nth-of-type(${nth})`;
    }
    path.unshift(selector);
    element = element.parentNode;
  }
  return path.join(" > ");
}

 // Function to fetch and store geolocation data
 export async function fetchGeolocation() {
  const geolocationData = localStorage.getItem("geolocationData");
  if (geolocationData) {

    return JSON.parse(geolocationData);
  }

  try {
    const response = await fetch('https://geolocation-db.com/json/', {
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'origin': 'https://app.jwero.ai',
        'referer': 'https://app.jwero.ai/',
        'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
      }
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("geolocationData", JSON.stringify(data));
    
      return data;
    } else {
      console.error("Failed to fetch geolocation data:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching geolocation data:", error);
  }

  return null;
}