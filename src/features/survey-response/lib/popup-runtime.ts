import { getPublicSurveyPath } from '@/lib/survey-routes';
import type { SurveyDelivery } from '@/types/survey';

export interface PopupDeliveryConfig {
  enabled: boolean;
  openMode: 'button_click' | 'page_load' | 'elapsed_time' | 'exit_intent' | 'scroll';
  delaySeconds: number;
  scrollPercent: number;
  position: 'center' | 'bottom_right';
  widthPx: number;
  hideTitle: boolean;
  alignContentLeft: boolean;
  darkOverlay: boolean;
  showOnce: boolean;
  preserveQueryParams: boolean;
}

export const DEFAULT_POPUP_DELIVERY: PopupDeliveryConfig = {
  enabled: false,
  openMode: 'button_click',
  delaySeconds: 5,
  scrollPercent: 50,
  position: 'center',
  widthPx: 480,
  hideTitle: false,
  alignContentLeft: false,
  darkOverlay: true,
  showOnce: true,
  preserveQueryParams: true,
};

export const normalizePopupDelivery = (
  delivery?: SurveyDelivery,
): PopupDeliveryConfig => ({
  ...DEFAULT_POPUP_DELIVERY,
  ...delivery?.popup,
});

export const buildPopupIframeUrl = ({
  publicCode,
  popup,
  origin,
  queryString,
}: {
  publicCode: string;
  popup: PopupDeliveryConfig;
  origin?: string;
  queryString?: string;
}) => {
  const resolvedOrigin = origin
    ?? (typeof window !== 'undefined' ? window.location.origin : 'https://survey-builder.local');
  const url = new URL(getPublicSurveyPath(publicCode), resolvedOrigin);

  url.searchParams.set('embedded', 'true');
  url.searchParams.set('popup', 'true');

  if (popup.preserveQueryParams && queryString) {
    const params = new URLSearchParams(queryString.startsWith('?') ? queryString.slice(1) : queryString);

    for (const [key, value] of params.entries()) {
      if (!url.searchParams.has(key)) {
        url.searchParams.set(key, value);
      }
    }
  }

  return url.toString();
};

export const getPopupStorageKey = (publicCode: string) => `survey-builder-popup:${publicCode}`;
