
export type TeamRole = 'owner' | 'editor' | 'viewer';

export interface Team {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
}

export interface TeamSurvey {
  id: string;
  team_id: string;
  survey_id: string;
}

export type TeamInvitation = {
  id: string;
  team_id: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  invited_at: string;
  accepted: boolean;
};

