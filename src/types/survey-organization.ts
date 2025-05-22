
import type { Database } from "./database";

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
}

export type SurveyOrganization = {
  folders: SurveyFolder[];
  unorganizedSurveys: Survey[];
}

export type ActiveUser = {
  id: string;
  name: string;
  avatarUrl?: string;
  lastActive?: Date;
}
