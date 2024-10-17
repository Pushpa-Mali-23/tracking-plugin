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
