
// Define types for the survey organization system
import type { Survey as FullSurvey } from "./survey";

// Simplified Survey type with only the properties needed for organization UI
export type Survey = {
  id: string;
  name: string;
  createdAt: string | Date;
  folderId?: string | null;
  isPublished?: boolean;
}

export type SurveyFolder = {
  id: string;
  name: string;
  surveys: Survey[];
  order?: number;
}

export type SurveyOrganization = {
  folders: SurveyFolder[];
  unorganizedSurveys: Survey[];
}

export type ActiveUser = {
  id: string;
  name: string;  // Required name property
  avatarUrl?: string;
  lastActive?: Date;
}

// Add a helper function to convert from full Survey type to organization Survey type
export function convertToOrganizationSurvey(fullSurvey: FullSurvey): Survey {
  return {
    id: fullSurvey.id,
    name: fullSurvey.title,
    createdAt: fullSurvey.createdAt || new Date(),
    folderId: fullSurvey.folderId,
    isPublished: fullSurvey.isPublished
  };
}
