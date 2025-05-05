
export interface SurveyFolder {
  id: string;
  name: string;
  surveys: Survey[];
  createdAt: Date;
}

export interface Survey {
  id: string;
  name: string;
  createdAt: Date;
  folderId?: string;
  teamId?: string;
}
