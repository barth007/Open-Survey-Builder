import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { RecordingsTab } from '@/features/survey-editor/components/RecordingsTab';

vi.mock('@/hooks/survey/useRecordingManagement', () => ({
  useRecordingManagement: () => ({
    recordings: [
      {
        id: 'rec-1',
        recordingUrl: 'https://example.com/rec-1.mp4',
        recordingType: 'screen-webcam',
        fileFormat: 'mp4',
        durationSeconds: 125,
        fileSizeBytes: 2_621_440,
        createdAt: '2026-03-25T09:15:00.000Z',
        responseId: 'resp-1',
        questionId: 'q-1',
      },
    ],
    isLoading: false,
    selectedRecording: null,
    handlePlay: vi.fn(),
    handleDownload: vi.fn(),
    handleDelete: vi.fn(),
    closePlayer: vi.fn(),
  }),
}));

vi.mock('@/features/survey-editor/components/RecordingPlayer', () => ({
  RecordingPlayer: () => null,
}));

describe('recordings layout shell', () => {
  it('renders a page-level recordings shell instead of the old generic management card', () => {
    const html = renderToStaticMarkup(
      <RecordingsTab surveyId="survey-1" />,
    );

    expect(html).toContain('Search recordings');
    expect(html).toContain('Latest upload');
    expect(html).not.toContain('bg-[#fafaf8]');
    expect(html).toContain('max-w-6xl');
    expect(html).not.toContain('Recordings (1)');
    expect(html).not.toContain('Recording Playback');
  });
});
