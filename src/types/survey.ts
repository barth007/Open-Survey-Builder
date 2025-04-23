
export type QuestionType = 'text' | 'multipleChoice' | 'checkboxes';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  isRequired: boolean;
  options: QuestionOption[];
}

export interface Survey {
  title: string;
  description: string;
  questions: Question[];
}
