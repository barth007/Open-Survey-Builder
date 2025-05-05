
export type TeamRole = 'owner' | 'editor' | 'viewer';

// src/types/team.ts

export type Team = {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  joined_at: string;
  email: string;
  full_name: string;
  avatar_url: string;
};

export type TeamInvitation = {
  id: string;
  team_id: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  invited_at: string;
  accepted: boolean;
};

export interface TeamSurvey {
  id: string;
  team_id: string;
  survey_id: string;
}

