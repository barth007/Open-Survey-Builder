import type { SurveyDelivery } from '@/types/survey';
import {
  buildPopupIframeUrl,
  normalizePopupDelivery,
} from '@/features/survey-response/lib/popup-runtime';

interface EmbedSnippetOptions {
  publicCode: string;
  delivery?: SurveyDelivery;
  origin?: string;
}

export const buildEmbedSnippet = ({
  publicCode,
  delivery,
  origin,
}: EmbedSnippetOptions) => {
  const popup = normalizePopupDelivery(delivery);
  const config = {
    publicCode,
    origin: origin
      ?? (typeof window !== 'undefined' ? window.location.origin : 'https://survey-builder.local'),
    popup,
  };
  const initialSrc = buildPopupIframeUrl({
    publicCode,
    popup,
    origin: config.origin,
  });
  const containerId = `sb-popup-root-${publicCode}`;

  return `<div id="${containerId}"></div>
<script>
(function () {
  const config = ${JSON.stringify(config)};
  const container = document.getElementById(${JSON.stringify(containerId)});
  if (!container) return;

  const storageKey = 'survey-builder-popup:' + config.publicCode;

  const buildSrc = function () {
    const url = new URL('/p/' + encodeURIComponent(config.publicCode), config.origin);
    url.searchParams.set('embedded', 'true');
    url.searchParams.set('popup', 'true');

    if (config.popup.preserveQueryParams && window.location.search) {
      const params = new URLSearchParams(window.location.search.slice(1));
      params.forEach(function (value, key) {
        if (!url.searchParams.has(key)) {
          url.searchParams.set(key, value);
        }
      });
    }

    return url.toString();
  };

  const shouldSkip = function () {
    return config.popup.showOnce && window.localStorage.getItem(storageKey) === '1';
  };

  const markOpened = function () {
    if (config.popup.showOnce) {
      window.localStorage.setItem(storageKey, '1');
    }
  };

  const openPopup = function () {
    if (shouldSkip() || document.getElementById(storageKey)) return;

    const overlay = document.createElement('div');
    overlay.id = storageKey;
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '2147483000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = config.popup.position === 'center' ? 'center' : 'flex-end';
    overlay.style.justifyContent = config.popup.position === 'center' ? 'center' : 'flex-end';
    overlay.style.padding = '24px';
    overlay.style.background = config.popup.darkOverlay ? 'rgba(15, 23, 42, 0.58)' : 'transparent';

    const frame = document.createElement('iframe');
    frame.src = buildSrc();
    frame.title = 'Embedded survey popup';
    frame.setAttribute('allow', 'clipboard-read; clipboard-write; camera; microphone');
    frame.style.width = Math.max(config.popup.widthPx || 480, 320) + 'px';
    frame.style.height = 'min(80vh, 760px)';
    frame.style.maxWidth = '100%';
    frame.style.border = '0';
    frame.style.borderRadius = '24px';
    frame.style.background = '#ffffff';
    frame.style.boxShadow = '0 30px 120px rgba(15, 23, 42, 0.28)';

    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) {
        overlay.remove();
      }
    });

    overlay.appendChild(frame);
    container.appendChild(overlay);
    markOpened();
  };

  if (!config.popup.enabled) return;

  if (config.popup.openMode === 'page_load') {
    openPopup();
    return;
  }

  if (config.popup.openMode === 'elapsed_time') {
    window.setTimeout(openPopup, Math.max(config.popup.delaySeconds || 0, 0) * 1000);
    return;
  }

  if (config.popup.openMode === 'scroll') {
    const onScroll = function () {
      const doc = document.documentElement;
      const maxScrollable = Math.max(doc.scrollHeight - window.innerHeight, 1);
      const percent = (window.scrollY / maxScrollable) * 100;

      if (percent >= (config.popup.scrollPercent || 0)) {
        window.removeEventListener('scroll', onScroll);
        openPopup();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return;
  }

  if (config.popup.openMode === 'exit_intent') {
    const onMouseLeave = function (event) {
      if (event.clientY <= 0) {
        document.removeEventListener('mouseout', onMouseLeave);
        openPopup();
      }
    };

    document.addEventListener('mouseout', onMouseLeave);
    return;
  }

  document.querySelectorAll('[data-survey-popup="' + config.publicCode + '"]').forEach(function (node) {
    node.addEventListener('click', function (event) {
      event.preventDefault();
      openPopup();
    });
  });
})();
</script>
<!-- iframe bootstrap: ${initialSrc} -->`;
};
