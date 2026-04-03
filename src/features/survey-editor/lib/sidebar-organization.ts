import type { Survey, SurveyFolder, SurveyOrganization } from '@/types/survey-organization';

const SURVEY_LIST_PREFIX = 'survey-list:';
const UNORGANIZED_LIST_ID = `${SURVEY_LIST_PREFIX}unorganized`;

const normalizeFolderId = (folderId?: string | null) => folderId ?? null;

const getSurveyTimestamp = (survey: Survey) => {
  const value = survey.createdAt instanceof Date
    ? survey.createdAt.getTime()
    : new Date(survey.createdAt).getTime();

  return Number.isNaN(value) ? 0 : value;
};

const sortSurveyList = (surveys: Survey[]) => (
  [...surveys].sort((left, right) => {
    const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    const dateDifference = getSurveyTimestamp(right) - getSurveyTimestamp(left);

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return left.name.localeCompare(right.name);
  })
);

const replaceSurveyList = (
  organization: SurveyOrganization,
  folderId: string | null,
  surveys: Survey[],
): SurveyOrganization => {
  if (folderId === null) {
    return {
      ...organization,
      unorganizedSurveys: surveys,
    };
  }

  return {
    ...organization,
    folders: organization.folders.map((folder) => (
      folder.id === folderId
        ? { ...folder, surveys }
        : folder
    )),
  };
};

const assignSurveyPositions = (
  surveys: Survey[],
  folderId: string | null,
) => (
  surveys.map((survey, index) => ({
    ...survey,
    folderId,
    order: index,
  }))
);

const moveItem = <T,>(items: T[], fromIndex: number, toIndex: number) => {
  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);

  nextItems.splice(toIndex, 0, movedItem);

  return nextItems;
};

type SurveyLocation = {
  survey: Survey;
  folderId: string | null;
  index: number;
};

export type SurveyPositionChange = {
  surveyId: string;
  order: number | null;
  folderId: string | null;
  includeAssociations: boolean;
};

export const buildSurveyListId = (folderId?: string | null) => (
  normalizeFolderId(folderId) === null
    ? UNORGANIZED_LIST_ID
    : `${SURVEY_LIST_PREFIX}${folderId}`
);

export const parseSurveyListId = (value: string) => {
  if (!value.startsWith(SURVEY_LIST_PREFIX)) {
    return undefined;
  }

  const rawFolderId = value.slice(SURVEY_LIST_PREFIX.length);

  return rawFolderId === 'unorganized' ? null : rawFolderId;
};

export const sortSurveyOrganization = (organization: SurveyOrganization): SurveyOrganization => ({
  folders: organization.folders.map((folder) => ({
    ...folder,
    surveys: sortSurveyList(folder.surveys),
  })),
  unorganizedSurveys: sortSurveyList(organization.unorganizedSurveys),
});

export const filterSurveyOrganization = (
  organization: SurveyOrganization,
  rawSearchTerm: string,
): SurveyOrganization => {
  const searchTerm = rawSearchTerm.trim().toLowerCase();

  if (!searchTerm) {
    return organization;
  }

  return {
    folders: organization.folders.flatMap((folder) => {
      const folderMatches = folder.name.toLowerCase().includes(searchTerm);
      const surveys = folderMatches
        ? folder.surveys
        : folder.surveys.filter((survey) => survey.name.toLowerCase().includes(searchTerm));

      return folderMatches || surveys.length > 0
        ? [{ ...folder, surveys }]
        : [];
    }),
    unorganizedSurveys: organization.unorganizedSurveys.filter((survey) => (
      survey.name.toLowerCase().includes(searchTerm)
    )),
  };
};

export const findSurveyLocation = (
  organization: SurveyOrganization,
  surveyId: string,
): SurveyLocation | null => {
  const unorganizedIndex = organization.unorganizedSurveys.findIndex((survey) => survey.id === surveyId);

  if (unorganizedIndex >= 0) {
    return {
      survey: organization.unorganizedSurveys[unorganizedIndex],
      folderId: null,
      index: unorganizedIndex,
    };
  }

  for (const folder of organization.folders) {
    const surveyIndex = folder.surveys.findIndex((survey) => survey.id === surveyId);

    if (surveyIndex >= 0) {
      return {
        survey: folder.surveys[surveyIndex],
        folderId: folder.id,
        index: surveyIndex,
      };
    }
  }

  return null;
};

const getSurveyList = (
  organization: SurveyOrganization,
  folderId: string | null,
) => (
  folderId === null
    ? organization.unorganizedSurveys
    : organization.folders.find((folder) => folder.id === folderId)?.surveys ?? []
);

export const moveSurveyInOrganization = (
  organization: SurveyOrganization,
  options: {
    activeId: string;
    overId?: string;
    targetFolderId?: string | null;
  },
): SurveyOrganization => {
  const activeLocation = findSurveyLocation(organization, options.activeId);

  if (!activeLocation) {
    return organization;
  }

  const overLocation = options.overId
    ? findSurveyLocation(organization, options.overId)
    : null;
  const destinationFolderId = options.targetFolderId !== undefined
    ? normalizeFolderId(options.targetFolderId)
    : overLocation?.folderId ?? activeLocation.folderId;

  if (destinationFolderId === activeLocation.folderId && !options.overId) {
    return organization;
  }

  const sourceList = getSurveyList(organization, activeLocation.folderId);

  if (destinationFolderId === activeLocation.folderId) {
    if (!overLocation || overLocation.folderId !== activeLocation.folderId) {
      return organization;
    }

    if (activeLocation.index === overLocation.index) {
      return organization;
    }

    const nextSurveys = assignSurveyPositions(
      moveItem(sourceList, activeLocation.index, overLocation.index),
      activeLocation.folderId,
    );

    return replaceSurveyList(organization, activeLocation.folderId, nextSurveys);
  }

  const destinationList = getSurveyList(organization, destinationFolderId).filter((survey) => survey.id !== options.activeId);
  const nextSourceSurveys = assignSurveyPositions(
    sourceList.filter((survey) => survey.id !== options.activeId),
    activeLocation.folderId,
  );

  const insertionIndex = overLocation && overLocation.folderId === destinationFolderId
    ? destinationList.findIndex((survey) => survey.id === overLocation.survey.id)
    : destinationList.length;
  const targetIndex = insertionIndex >= 0 ? insertionIndex : destinationList.length;
  const movedSurvey: Survey = {
    ...activeLocation.survey,
    folderId: destinationFolderId,
  };

  const nextDestinationSurveys = assignSurveyPositions(
    [
      ...destinationList.slice(0, targetIndex),
      movedSurvey,
      ...destinationList.slice(targetIndex),
    ],
    destinationFolderId,
  );

  const withUpdatedSource = replaceSurveyList(organization, activeLocation.folderId, nextSourceSurveys);

  return replaceSurveyList(withUpdatedSource, destinationFolderId, nextDestinationSurveys);
};

export const collectSurveyPositionChanges = (
  previousOrganization: SurveyOrganization,
  nextOrganization: SurveyOrganization,
): SurveyPositionChange[] => {
  const previousById = new Map<string, Survey>();
  const nextSurveys = [
    ...nextOrganization.unorganizedSurveys,
    ...nextOrganization.folders.flatMap((folder) => folder.surveys),
  ];

  for (const survey of previousOrganization.unorganizedSurveys) {
    previousById.set(survey.id, survey);
  }

  for (const folder of previousOrganization.folders) {
    for (const survey of folder.surveys) {
      previousById.set(survey.id, survey);
    }
  }

  return nextSurveys.flatMap((survey) => {
    const previousSurvey = previousById.get(survey.id);

    if (!previousSurvey) {
      return [];
    }

    const previousFolderId = normalizeFolderId(previousSurvey.folderId);
    const nextFolderId = normalizeFolderId(survey.folderId);
    const previousOrder = previousSurvey.order ?? null;
    const nextOrder = survey.order ?? null;

    if (previousFolderId === nextFolderId && previousOrder === nextOrder) {
      return [];
    }

    return [{
      surveyId: survey.id,
      folderId: nextFolderId,
      order: nextOrder,
      includeAssociations: previousFolderId !== nextFolderId,
    }];
  });
};

export const isSurveyOrganizationEmpty = (organization: SurveyOrganization) => (
  organization.folders.length === 0 && organization.unorganizedSurveys.length === 0
);

export const hasSurveyOrganizationMatches = (organization: SurveyOrganization) => (
  organization.unorganizedSurveys.length > 0
  || organization.folders.length > 0
);

export type { SurveyFolder, SurveyOrganization };
