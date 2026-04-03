import type { SurveyAppearance, SurveyBranding } from '@/types/survey';

export const DEFAULT_SURVEY_APPEARANCE: SurveyAppearance = {
  themeMode: 'custom',
  colors: {
    background: '#f4efe2',
    cardBackground: '#fff8ef',
    text: '#1b1b18',
    primary: '#cc5a24',
    primaryForeground: '#fffdf8',
    border: '#dccbb6',
    progress: '#cc5a24',
  },
  fonts: {
    heading: '"Fraunces", Georgia, serif',
    body: '"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif',
    source: 'system',
  },
  layout: {
    width: 'standard',
    cardStyle: 'soft',
    questionSpacing: 'comfortable',
    showProductBranding: true,
  },
  inputs: {
    style: 'rounded',
    borderWidth: 1,
  },
  buttons: {
    style: 'pill',
    shadow: true,
  },
  progressBar: {
    enabled: true,
    position: 'top',
  },
  customCss: '',
};

export const mergeSurveyAppearance = (
  appearance?: SurveyAppearance,
): SurveyAppearance => ({
  ...DEFAULT_SURVEY_APPEARANCE,
  ...appearance,
  colors: {
    ...DEFAULT_SURVEY_APPEARANCE.colors,
    ...appearance?.colors,
  },
  fonts: {
    ...DEFAULT_SURVEY_APPEARANCE.fonts,
    ...appearance?.fonts,
  },
  layout: {
    ...DEFAULT_SURVEY_APPEARANCE.layout,
    ...appearance?.layout,
  },
  inputs: {
    ...DEFAULT_SURVEY_APPEARANCE.inputs,
    ...appearance?.inputs,
  },
  buttons: {
    ...DEFAULT_SURVEY_APPEARANCE.buttons,
    ...appearance?.buttons,
  },
  progressBar: {
    ...DEFAULT_SURVEY_APPEARANCE.progressBar,
    ...appearance?.progressBar,
  },
});

export const mergeSurveyBranding = (
  branding?: SurveyBranding,
): SurveyBranding => ({
  logo: branding?.logo,
  coverImage: branding?.coverImage,
});
