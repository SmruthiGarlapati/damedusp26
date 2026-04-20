"use client";

import { useEffect } from "react";

const NEXT_ERROR_SELECTORS = [
  "nextjs-portal",
  "script[data-nextjs-dev-overlay]",
  "[data-next-badge-root]",
  "[data-nextjs-dialog]",
  "[data-nextjs-toast]",
].join(", ");

function hideNextDevNodes() {
  document.querySelectorAll(NEXT_ERROR_SELECTORS).forEach((node) => {
    if (!(node instanceof HTMLElement)) return;

    node.style.setProperty("display", "none", "important");
    node.style.setProperty("visibility", "hidden", "important");
    node.style.setProperty("opacity", "0", "important");
    node.style.setProperty("pointer-events", "none", "important");
    node.setAttribute("aria-hidden", "true");
  });
}

export default function NextErrorSuppressor() {
  useEffect(() => {
    const styleId = "rapt-hide-next-errors";

    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        ${NEXT_ERROR_SELECTORS} {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    hideNextDevNodes();

    const observer = new MutationObserver(() => {
      hideNextDevNodes();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    const intervalId = window.setInterval(hideNextDevNodes, 800);

    return () => {
      observer.disconnect();
      window.clearInterval(intervalId);
    };
  }, []);

  return null;
}
