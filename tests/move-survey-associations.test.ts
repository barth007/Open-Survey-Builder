import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const moveDialogPath = path.resolve(__dirname, '../src/features/survey-editor/components/MoveSurveyDialog.tsx');
const surveyDataPath = path.resolve(__dirname, '../src/hooks/useSurveyData.ts');

describe('move survey association updates', () => {
  it('sends folder changes from the move dialog with association updates enabled', () => {
    const source = readFileSync(moveDialogPath, 'utf8');

    expect(source).toContain('folderId');
    expect(source).toContain('includeAssociations: true');
  });

  it('sends cross-folder drag moves with association updates enabled', () => {
    const source = readFileSync(surveyDataPath, 'utf8');

    expect(source).toContain('folderId: change.folderId');
    expect(source).toContain('includeAssociations: change.includeAssociations');
    expect(source).toContain('skipInvalidation: true');
  });
});
