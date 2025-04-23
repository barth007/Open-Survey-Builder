
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
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  description?: string; // Added description field
  isRequired: boolean;
  options: QuestionOption[];
  maxSelections?: number; // For checkboxes: how many options can be selected
  figmaPrototypeUrl?: string;
  media?: Media; // Media for the question itself
  conditionalLogic?: ConditionalLogic; // Added conditional logic
}

export interface ConditionalLogic {
  dependsOn: string; // Question ID this question depends on
  showWhen: {
    optionId: string; // Option ID that triggers this question to show
    operator: 'equals' | 'notEquals' | 'contains' | 'notContains';
  }[];
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  isPublished: boolean;
  sharableLink?: string;
  responseLimit?: number;
  responses?: SurveyResponse[];
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: Answer[];
  submittedAt: string;
}

export interface Answer {
  questionId: string;
  value: string | string[]; // Single value or array of values for checkbox questions
}

// Likert scale labels
export const LIKERT_5_LABELS = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'];
export const LIKERT_7_LABELS = ['Strongly disagree', 'Disagree', 'Somewhat disagree', 'Neutral', 'Somewhat agree', 'Agree', 'Strongly agree'];
export const LIKERT_10_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
