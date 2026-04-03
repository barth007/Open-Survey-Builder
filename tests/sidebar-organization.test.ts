import { describe, expect, it } from 'vitest';

import {
  collectSurveyPositionChanges,
  filterSurveyOrganization,
  moveSurveyInOrganization,
  sortSurveyOrganization,
} from '@/features/survey-editor/lib/sidebar-organization';
import type { SurveyOrganization } from '@/types/survey-organization';

const organization: SurveyOrganization = {
  folders: [
    {
      id: 'folder-1',
      name: 'Research',
      surveys: [
        {
          id: 'survey-1',
          name: 'Alpha interviews',
          createdAt: '2026-04-01T10:00:00.000Z',
          folderId: 'folder-1',
          order: 0,
        },
        {
          id: 'survey-2',
          name: 'Beta usability',
          createdAt: '2026-04-01T09:00:00.000Z',
          folderId: 'folder-1',
          order: 1,
        },
      ],
    },
    {
      id: 'folder-2',
      name: 'Archive',
      surveys: [],
    },
  ],
  unorganizedSurveys: [
    {
      id: 'survey-3',
      name: 'Customer pulse',
      createdAt: '2026-04-01T08:00:00.000Z',
      folderId: null,
      order: 0,
    },
  ],
};

describe('sidebar organization helpers', () => {
  it('filters folders by matching nested survey names', () => {
    const filtered = filterSurveyOrganization(organization, 'beta');

    expect(filtered.folders).toHaveLength(1);
    expect(filtered.folders[0].id).toBe('folder-1');
    expect(filtered.folders[0].surveys.map((survey) => survey.id)).toEqual(['survey-2']);
    expect(filtered.unorganizedSurveys).toHaveLength(0);
  });

  it('keeps every survey in a folder when the folder name matches the search term', () => {
    const filtered = filterSurveyOrganization(organization, 'research');

    expect(filtered.folders).toHaveLength(1);
    expect(filtered.folders[0].surveys.map((survey) => survey.id)).toEqual(['survey-1', 'survey-2']);
  });

  it('reorders surveys within the same list and reassigns order values', () => {
    const nextOrganization = moveSurveyInOrganization(organization, {
      activeId: 'survey-2',
      overId: 'survey-1',
    });

    expect(nextOrganization.folders[0].surveys.map((survey) => survey.id)).toEqual(['survey-2', 'survey-1']);
    expect(nextOrganization.folders[0].surveys.map((survey) => survey.order)).toEqual([0, 1]);
  });

  it('moves surveys across lists, updates folder ownership, and reports only changed positions', () => {
    const nextOrganization = moveSurveyInOrganization(organization, {
      activeId: 'survey-3',
      overId: 'survey-2',
      targetFolderId: 'folder-1',
    });
    const sortedOrganization = sortSurveyOrganization(nextOrganization);
    const changes = collectSurveyPositionChanges(organization, sortedOrganization);

    expect(sortedOrganization.folders[0].surveys.map((survey) => survey.id)).toEqual([
      'survey-1',
      'survey-3',
      'survey-2',
    ]);
    expect(sortedOrganization.folders[0].surveys.map((survey) => survey.order)).toEqual([0, 1, 2]);
    expect(sortedOrganization.folders[0].surveys[1].folderId).toBe('folder-1');
    expect(sortedOrganization.unorganizedSurveys).toHaveLength(0);
    expect(changes).toEqual([
      {
        surveyId: 'survey-3',
        folderId: 'folder-1',
        order: 1,
        includeAssociations: true,
      },
      {
        surveyId: 'survey-2',
        folderId: 'folder-1',
        order: 2,
        includeAssociations: false,
      },
    ]);
  });
});
