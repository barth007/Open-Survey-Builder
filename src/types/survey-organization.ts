// Remove the Database import since we're not using it
import type { Survey } from "./survey";

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
