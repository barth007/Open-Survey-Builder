const cloneInjectionNode = (node: ChildNode) => {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return node.cloneNode(true);
  }

  const element = node as Element;

  if (element.tagName.toLowerCase() === 'script') {
    const script = document.createElement('script');

    for (const attr of element.getAttributeNames()) {
      const value = element.getAttribute(attr);
      if (value !== null) {
        script.setAttribute(attr, value);
      }
    }

    script.textContent = element.textContent;
    return script;
  }

  return element.cloneNode(true);
};

const mountHtmlFragment = (target: HTMLElement, html?: string | null) => {
  if (!html || typeof document === 'undefined') {
    return () => {};
  }

  const template = document.createElement('template');
  template.innerHTML = html;
  const nodes = Array.from(template.content.childNodes).map(cloneInjectionNode);

  nodes.forEach((node) => target.appendChild(node));

  return () => {
    nodes.forEach((node) => {
      if (node.parentNode === target) {
        target.removeChild(node);
      }
    });
  };
};

export const mountDomainHeadInjection = (html?: string | null) => (
  mountHtmlFragment(document.head, html)
);

export const mountDomainBodyInjection = (html?: string | null) => (
  mountHtmlFragment(document.body, html)
);
