import { describe, expect, it } from 'vitest';

import type {
  FileUploadAnswerValue,
  MatrixAnswerValue,
  Question,
  RankingAnswerValue,
  VerificationAnswerValue,
} from '@/types/survey';
import {
  getAnswerAnalyticsValues,
  isAnswerValueEmpty,
  serializeFilesForAnswer,
  validateRequiredAnswer,
} from '@/lib/answer-values';

const choiceQuestion: Question = {
  id: 'q-choice',
  type: 'multipleChoice',
  blockType: 'multipleChoice',
  text: 'Pick one',
  isRequired: true,
  options: [
    { id: 'a', text: 'Alpha' },
    { id: 'b', text: 'Beta' },
    { id: 'c', text: 'Gamma' },
  ],
};

const matrixQuestion: Question = {
  id: 'q-matrix',
  type: 'matrix',
  blockType: 'matrix',
  text: 'Rate each',
  isRequired: true,
  options: [
    { id: 'row-1', text: 'Support' },
    { id: 'row-2', text: 'Speed' },
  ],
  matrixColumns: [
    { id: 'col-1', text: 'Poor' },
    { id: 'col-2', text: 'Great' },
  ],
};

const verificationQuestion: Question = {
  id: 'q-verify',
  type: 'recaptcha',
  blockType: 'recaptcha',
  text: 'Verify',
  isRequired: true,
  options: [],
};

describe('answer-values helpers', () => {
  it('maps ranking answers into a readable analytics summary', () => {
    const value: RankingAnswerValue = {
      kind: 'ranking',
      orderedOptionIds: ['c', 'a', 'b'],
    };

    expect(getAnswerAnalyticsValues(choiceQuestion, value)).toEqual([
      '1. Gamma > 2. Alpha > 3. Beta',
    ]);
  });

  it('maps matrix selections into row-by-row analytics entries', () => {
    const value: MatrixAnswerValue = {
      kind: 'matrix',
      selections: {
        'row-1': 'col-2',
        'row-2': 'col-1',
      },
    };

    expect(getAnswerAnalyticsValues(matrixQuestion, value)).toEqual([
      'Support: Great',
      'Speed: Poor',
    ]);
  });

  it('serializes uploaded files into JSON-safe answer values', async () => {
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain', lastModified: 123 });

    const value = await serializeFilesForAnswer([file], 1024);

    expect(value.kind).toBe('fileUpload');
    expect(value.files).toHaveLength(1);
    expect(value.files[0]).toEqual(
      expect.objectContaining({
        name: 'notes.txt',
        type: 'text/plain',
        size: 5,
        lastModified: 123,
      }),
    );
    expect(value.files[0].dataUrl.startsWith('data:text/plain;base64,')).toBe(true);
  });

  it('detects empty advanced answer values correctly', () => {
    const emptyFiles: FileUploadAnswerValue = { kind: 'fileUpload', files: [] };
    const uncheckedVerification: VerificationAnswerValue = {
      kind: 'verification',
      verified: false,
      provider: 'local',
    };

    expect(isAnswerValueEmpty(emptyFiles)).toBe(true);
    expect(isAnswerValueEmpty(uncheckedVerification)).toBe(true);
    expect(
      isAnswerValueEmpty({
        kind: 'signature',
        dataUrl: 'data:image/png;base64,abc',
        signedAt: '2026-03-25T00:00:00.000Z',
      }),
    ).toBe(false);
  });

  it('validates required advanced answers', () => {
    expect(validateRequiredAnswer(verificationQuestion, undefined)).toBe('Please complete the verification step.');
    expect(
      validateRequiredAnswer(verificationQuestion, {
        kind: 'verification',
        verified: false,
        provider: 'local',
      }),
    ).toBe('Please complete the verification step.');
    expect(
      validateRequiredAnswer(verificationQuestion, {
        kind: 'verification',
        verified: true,
        provider: 'local',
      }),
    ).toBeNull();
    expect(
      validateRequiredAnswer(matrixQuestion, {
        kind: 'matrix',
        selections: { 'row-1': 'col-2' },
      }),
    ).toBe('Please answer each row.');
  });
});
