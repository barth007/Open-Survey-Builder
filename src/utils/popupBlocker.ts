

// Popup blocker utility to prevent any external popups from appearing
export const initializePopupBlocker = () => {
  console.log('[Popup Blocker] Initializing...');

  // Keywords and patterns to identify popup elements
  const popupKeywords = [
    'edit with lovable',
    'edit in lovable',
    'lovable',
    'edit this page',
    'edit code',
    'powered by',
    'made with'
  ];

  // Function to check if an element should be blocked
  const shouldBlockElement = (element: Element): boolean => {
    if (!element) return false;

    // Check text content
    const textContent = element.textContent?.toLowerCase() || '';
    if (popupKeywords.some(keyword => textContent.includes(keyword))) {
      return true;
    }

    // Check attributes
    const attributes = ['class', 'id', 'data-testid', 'aria-label', 'title'];
    for (const attr of attributes) {
      const value = element.getAttribute(attr)?.toLowerCase() || '';
      if (popupKeywords.some(keyword => value.includes(keyword))) {
        return true;
      }
    }

    // Check if it's a fixed positioned element in bottom-right corner
    const computedStyle = window.getComputedStyle(element);
    if (
      computedStyle.position === 'fixed' &&
      (computedStyle.bottom !== 'auto' || computedStyle.right !== 'auto') &&
      parseInt(computedStyle.zIndex) > 1000
    ) {
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
        position: absolute !important;
        left: -9999px !important;
        top: -9999px !important;
        width: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
      `;
    }
  };

  // Scan existing elements
  const scanExistingElements = () => {
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      if (shouldBlockElement(element)) {
        removeBlockedElement(element);
      }
    });
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

          // Check all child elements
          const children = element.querySelectorAll('*');
          children.forEach(child => {
            if (shouldBlockElement(child)) {
              removeBlockedElement(child);
            }
          });
        }
      });

      // Check for attribute changes that might reveal popups
      if (mutation.type === 'attributes') {
        const element = mutation.target as Element;
        if (shouldBlockElement(element)) {
          removeBlockedElement(element);
        }
      }
    });
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'id', 'style', 'data-testid']
  });

  // Scan existing elements immediately
  scanExistingElements();

  // Also scan periodically as a fallback
  const intervalScan = setInterval(scanExistingElements, 1000);

  // Override common popup injection methods
  const originalAppendChild = Node.prototype.appendChild;
  const originalInsertBefore = Node.prototype.insertBefore;

  Node.prototype.appendChild = function<T extends Node>(newChild: T): T {
    const result = originalAppendChild.call(this, newChild);
    // Only check if it's an Element node
    if (newChild.nodeType === Node.ELEMENT_NODE) {
      const element = newChild as unknown as Element;
      if (shouldBlockElement(element)) {
        removeBlockedElement(element);
      }
    }
    return result;
  };

  Node.prototype.insertBefore = function<T extends Node>(newChild: T, referenceChild: Node | null): T {
    const result = originalInsertBefore.call(this, newChild, referenceChild);
    // Only check if it's an Element node
    if (newChild.nodeType === Node.ELEMENT_NODE) {
      const element = newChild as unknown as Element;
      if (shouldBlockElement(element)) {
        removeBlockedElement(element);
      }
    }
    return result;
  };

  console.log('[Popup Blocker] Initialized successfully');

  // Return cleanup function
  return () => {
    observer.disconnect();
    clearInterval(intervalScan);
    Node.prototype.appendChild = originalAppendChild;
    Node.prototype.insertBefore = originalInsertBefore;
    console.log('[Popup Blocker] Cleaned up');
  };
};

