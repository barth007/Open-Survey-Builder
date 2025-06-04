import { describe, expect, it } from 'vitest';
import { dbSurveyToSurvey, surveyToDbSurvey } from '../src/utils/type-mappers';
import type { DbSurvey } from '../src/types/database';
import type { Survey, Question } from '../src/types/survey';

const sampleQuestion: Question = {
  id: 'q1',
  type: 'text',
  text: 'Question 1',
  isRequired: false,
  options: []
};

const dbSurvey: DbSurvey = {
  id: '1',
  name: 'Survey',
  description: 'desc',
  questions: [sampleQuestion] as any,
  is_published: true,
  folder_id: 'f1',
  team_id: 't1',
  order: null,
  public_code: 'abc',
  created_at: '2024-01-01T00:00:00.000Z',
  user_id: null,
  welcome_title: 'Welcome',
  welcome_message: 'Msg',
  welcome_instructions: 'Instr',
  welcome_button_text: 'Next',
  thank_you_title: 'Thanks',
  thank_you_message: 'Bye',
  thank_you_button_text: 'Finish',
  redirect_url: 'https://example.com'
};

const survey: Survey = {
  id: '1',
  title: 'Survey',
  description: 'desc',
  questions: [sampleQuestion],
  isPublished: true,
  folderId: 'f1',
  teamId: 't1',
  publicCode: 'abc',
  welcomeTitle: 'Welcome',
  welcomeMessage: 'Msg',
  welcomeInstructions: 'Instr',
  welcomeButtonText: 'Next',
  thankYouTitle: 'Thanks',
  thankYouMessage: 'Bye',
  thankYouButtonText: 'Finish',
  redirectUrl: 'https://example.com'
};

describe('type-mappers', () => {
  it('converts DbSurvey to Survey', () => {
    const result = dbSurveyToSurvey(dbSurvey);
    expect(result).toEqual({
      id: '1',
      title: 'Survey',
      description: 'desc',
      questions: [expect.objectContaining(sampleQuestion)],
      isPublished: true,
      folderId: 'f1',
      teamId: 't1',
      publicCode: 'abc',
      createdAt: '2024-01-01T00:00:00.000Z',
      welcomeTitle: 'Welcome',
      welcomeMessage: 'Msg',
      welcomeInstructions: 'Instr',
      welcomeButtonText: 'Next',
      thankYouTitle: 'Thanks',
      thankYouMessage: 'Bye',
      thankYouButtonText: 'Finish',
      redirectUrl: 'https://example.com'
    });
  });

  it('converts Survey to DbSurvey', () => {
    const result = surveyToDbSurvey(survey);
    expect(result).toEqual({
      id: '1',
      name: 'Survey',
      description: 'desc',
      is_published: true,
      questions: [sampleQuestion],
      folder_id: 'f1',
      team_id: 't1',
      public_code: 'abc',
      welcome_title: 'Welcome',
      welcome_message: 'Msg',
      welcome_instructions: 'Instr',
      welcome_button_text: 'Next',
      thank_you_title: 'Thanks',
      thank_you_message: 'Bye',
      thank_you_button_text: 'Finish',
      redirect_url: 'https://example.com'
    });
  });
});
