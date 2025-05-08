
export type Team = {
  id: string;
  name: string;
  description: string | null;
  created_at: string | null;
  owner_id: string;
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string | null;
  profile?: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
};

export type TeamInvitation = {
  id: string;
  team_id: string;
  email: string;
  created_at: string | null;
  expires_at: string;
  invitation_code: string;
  status: 'pending' | 'accepted' | 'rejected';
  team?: Team; // Include team information for received invitations
};
