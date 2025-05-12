

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

export interface ActiveUser {
  id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  last_active: Date;
}

