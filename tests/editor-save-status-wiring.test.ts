import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const editorPath = path.resolve(__dirname, '../src/features/survey-editor/pages/Editor.tsx');
const headerPath = path.resolve(__dirname, '../src/features/survey-editor/components/SurveyNavigationHeader.tsx');

describe('editor save status wiring', () => {
  it('removes the typing placeholder wiring from the editor header integration', () => {
    const editorSource = readFileSync(editorPath, 'utf8');

    expect(editorSource).not.toContain('Typing...');
    expect(editorSource).not.toContain('const getStatusText = () => {');
    expect(editorSource).not.toContain('statusText={getStatusText()}');
  });

  it('does not expose a dead statusText prop on the survey navigation header', () => {
    const headerSource = readFileSync(headerPath, 'utf8');

    expect(headerSource).not.toContain('statusText?: string | null;');
    expect(headerSource).not.toContain('statusText\n');
  });
});
