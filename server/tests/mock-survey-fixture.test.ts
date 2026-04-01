import { describe, expect, it } from 'vitest';

import { createMockSurveyFixture } from '../scripts/mock-survey-fixture.mjs';

describe('mock survey fixture', () => {
  it('builds a published survey with five complete responses', () => {
    const fixture = createMockSurveyFixture();
    const answerableQuestionIds = fixture.survey.questions
      .filter((question) => question.type !== 'content')
      .map((question) => question.id);

    expect(fixture.survey.isPublished).toBe(true);
    expect(fixture.survey.publicCode).toBe('demo-product-research-2026');
    expect(fixture.participants).toHaveLength(5);
    expect(fixture.responses).toHaveLength(5);

    for (const response of fixture.responses) {
      expect(response.participantEmail).toBeTruthy();
      expect(response.metadata?.email).toBe(response.participantEmail);
      expect(response.answers).toHaveLength(answerableQuestionIds.length);
      expect(response.answers.map((answer) => answer.questionId)).toEqual(answerableQuestionIds);
    }
  });
});
