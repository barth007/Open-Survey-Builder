
export type QuestionType = 'text' | 'multipleChoice' | 'checkboxes' | 'likert5' | 'likert7' | 'likert10';

export interface QuestionOption {
  id: string;
  text: string;
  media?: {
    type: 'image' | 'video' | 'gif';
    url: string;
  };
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  isRequired: boolean;
  options: QuestionOption[];
  maxSelections?: number; // For checkboxes: how many options can be selected
  figmaPrototypeUrl?: string;
}

export interface Survey {
  title: string;
  description: string;
  questions: Question[];
}

// Likert scale labels
export const LIKERT_5_LABELS = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'];
export const LIKERT_7_LABELS = ['Strongly disagree', 'Disagree', 'Somewhat disagree', 'Neutral', 'Somewhat agree', 'Agree', 'Strongly agree'];
export const LIKERT_10_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
