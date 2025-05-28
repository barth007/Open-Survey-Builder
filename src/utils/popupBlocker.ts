
// Popup blocker utility to prevent any external popups from appearing
export const initializePopupBlocker = () => {
  console.log('[Popup Blocker] Initializing...');

  // Keywords and patterns to identify popup elements
  const popupKeywords = [
    'edit with lovable',
    'edit in lovable',
    'edit this page',
    'edit code',
    'powered by',
    'made with'
  ];

  // Essential elements that should never be blocked
  const essentialTags = ['html', 'head', 'body', 'script', 'style', 'link', 'meta', 'title'];

  // Function to check if an element should be blocked
  const shouldBlockElement = (element: Element): boolean => {
    if (!element) return false;

    // Never block essential HTML structure elements
    const tagName = element.tagName?.toLowerCase();
    if (essentialTags.includes(tagName)) {
      return false;
    }

    // Never block elements that are part of the main app structure
    if (element.id === 'root' || element.closest('#root')) {
      return false;
    }

    // Only target specific lovable badge elements
    if (element.id === 'lovable-badge' || element.id === 'lovable-badge-close') {
      return true;
    }

    // Check for lovable-specific attributes
    const attributes = ['class', 'id', 'data-testid', 'aria-label', 'title'];
    for (const attr of attributes) {
      const value = element.getAttribute(attr)?.toLowerCase() || '';
      if (value.includes('lovable')) {
        return true;
      }
    }

    // Check text content only for non-essential elements
    const textContent = element.textContent?.toLowerCase() || '';
    if (popupKeywords.some(keyword => textContent.includes(keyword))) {
      // Additional safety check - make sure it's not a large container
      if (textContent.length > 100) {
        return false;
      }
      return true;
    }

    // Check if it's a fixed positioned element in corner (likely a badge/popup)
    const computedStyle = window.getComputedStyle(element);
    if (
      computedStyle.position === 'fixed' &&
      (computedStyle.bottom !== 'auto' || computedStyle.right !== 'auto') &&
      parseInt(computedStyle.zIndex) > 1000 &&
      element.tagName?.toLowerCase() !== 'div' // Be more specific about what we block
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
    // Only scan for specific lovable elements, not all elements
    const lovableBadge = document.getElementById('lovable-badge');
    if (lovableBadge && shouldBlockElement(lovableBadge)) {
      removeBlockedElement(lovableBadge);
    }

    const lovableBadgeClose = document.getElementById('lovable-badge-close');
    if (lovableBadgeClose && shouldBlockElement(lovableBadgeClose)) {
      removeBlockedElement(lovableBadgeClose);
    }

    // Check for elements with lovable in their attributes
    const elementsWithLovable = document.querySelectorAll('[class*="lovable"], [id*="lovable"], [data-testid*="lovable"]');
    elementsWithLovable.forEach(element => {
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

          // Only check children for non-essential elements
          if (!essentialTags.includes(element.tagName?.toLowerCase())) {
            const children = element.querySelectorAll('*');
            children.forEach(child => {
              if (shouldBlockElement(child)) {
                removeBlockedElement(child);
              }
            });
          }
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

  // Start observing only the body, not the entire document
  const targetNode = document.body || document.documentElement;
  observer.observe(targetNode, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'id', 'style', 'data-testid']
  });

  // Scan existing elements immediately
  scanExistingElements();

  // Scan periodically but less frequently
  const intervalScan = setInterval(scanExistingElements, 3000);

  // Override common popup injection methods with safer checks
  const originalAppendChild = Node.prototype.appendChild;
  const originalInsertBefore = Node.prototype.insertBefore;

  Node.prototype.appendChild = function<T extends Node>(newChild: T): T {
    const result = originalAppendChild.call(this, newChild);
    // Only check if it's an Element node and not an essential element
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
    // Only check if it's an Element node and not an essential element
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
