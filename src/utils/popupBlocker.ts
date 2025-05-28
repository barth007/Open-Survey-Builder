
// Popup blocker utility to prevent Lovable badge from appearing
export const initializePopupBlocker = () => {
  console.log('[Popup Blocker] Initializing...');

  // Function to check if an element should be blocked - very specific targeting
  const shouldBlockElement = (element: Element): boolean => {
    if (!element) return false;

    // Only target these specific elements by ID
    if (element.id === 'lovable-badge' || element.id === 'lovable-badge-close') {
      return true;
    }

    return false;
  };

  // Function to remove blocked elements
  const removeBlockedElement = (element: Element) => {
    try {
      console.log('[Popup Blocker] Removing blocked element:', element);
      element.remove();
    } catch (error) {
      console.warn('[Popup Blocker] Failed to remove element:', error);
      // Fallback: hide with CSS
      (element as HTMLElement).style.cssText = `
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      `;
    }
  };

  // Scan for specific elements only
  const scanForLovableBadge = () => {
    const lovableBadge = document.getElementById('lovable-badge');
    if (lovableBadge) {
      removeBlockedElement(lovableBadge);
    }

    const lovableBadgeClose = document.getElementById('lovable-badge-close');
    if (lovableBadgeClose) {
      removeBlockedElement(lovableBadgeClose);
    }
  };

  // Create mutation observer to watch for new elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // Check added nodes
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // Check the element itself
          if (shouldBlockElement(element)) {
            removeBlockedElement(element);
            return;
          }

          // Check if it's a container that might have our target elements
          if (element.querySelector) {
            const lovableBadge = element.querySelector('#lovable-badge');
            if (lovableBadge) {
              removeBlockedElement(lovableBadge);
            }
            
            const lovableBadgeClose = element.querySelector('#lovable-badge-close');
            if (lovableBadgeClose) {
              removeBlockedElement(lovableBadgeClose);
            }
          }
        }
      });
    });
  });

  // Start observing only the body
  const targetNode = document.body || document.documentElement;
  observer.observe(targetNode, {
    childList: true,
    subtree: true
  });

  // Scan existing elements immediately
  scanForLovableBadge();

  // Scan periodically but less frequently
  const intervalScan = setInterval(scanForLovableBadge, 2000);

  console.log('[Popup Blocker] Initialized successfully');

  // Return cleanup function
  return () => {
    observer.disconnect();
    clearInterval(intervalScan);
    console.log('[Popup Blocker] Cleaned up');
  };
};
