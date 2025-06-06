
export type QuestionType = 'text' | 'multipleChoice' | 'checkboxes' | 'likert5' | 'likert7' | 'likert10';

export type MediaType = 'image' | 'video' | 'gif';

export interface Media {
  type: MediaType;
  url: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  media?: Media;
  value?: string;
}

export interface ConditionalLogic {
  dependsOn: string; // Question ID this question depends on
  operator: 'equals' | 'notEquals' | 'isAnswered' | 'isNotAnswered';
  value?: string; // The option ID to match against
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  description?: string;
  isRequired: boolean;
  options: QuestionOption[];
  maxSelections?: number;
  media?: Media;
  figmaPrototypeUrl?: string;
  figmaScreenshot?: string;
  conditionalLogic?: ConditionalLogic;
  customLikertLabels?: boolean; // Flag to indicate if the question uses custom Likert labels
  isVisible?: boolean;
  // Remove question-level recording settings
}

/**
 * Front-end Survey interface - used throughout the application UI
 */
export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  isPublished: boolean;
  folderId?: string;
  teamId?: string; 
  sharableLink?: string;
  responseLimit?: number;
  responses?: SurveyResponse[];
  publicCode?: string;
  order?: number;
  createdAt?: string | Date; // Added createdAt field for compatibility
  // Welcome page fields
  welcomeTitle?: string;
  welcomeMessage?: string;
  welcomeInstructions?: string;
  welcomeButtonText?: string;
  // Thank you page fields
  thankYouTitle?: string;
  thankYouMessage?: string;
  thankYouButtonText?: string;
  redirectUrl?: string;
  // Survey-wide recording settings (screen + webcam)
  recordingEnabled?: boolean;
  recordingRequired?: boolean;
}

/**
 * Front-end Answer interface - represents a user's answer to a question
 */
export interface Answer {
  questionId: string;
  value: string | string[];
  recordingUrl?: string; // Optional recording for this answer
}

/**
 * Front-end SurveyResponse interface - represents a completed survey submission
 */
export interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: Answer[];
  submittedAt: string;
  participantId?: string;
  metadata?: Record<string, any>;
}

/**
 * Recording metadata interface
 */
export interface QuestionRecording {
  id: string;
  responseId: string;
  questionId: string;
  recordingUrl: string;
  recordingType: 'screen-webcam'; // Only support screen + webcam recording
  fileFormat: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  createdAt: string;
  metadata?: Record<string, any>;
}

export const LIKERT_5_LABELS = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'];
export const LIKERT_7_LABELS = ['Strongly disagree', 'Disagree', 'Somewhat disagree', 'Neutral', 'Somewhat agree', 'Agree', 'Strongly agree'];
export const LIKERT_10_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
