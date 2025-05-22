
import type { Database } from "./database";

export type Survey = {
  id: string;
  name: string;
  createdAt: string | Date;
  folderId?: string | null;
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
