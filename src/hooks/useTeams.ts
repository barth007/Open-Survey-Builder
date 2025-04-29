
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { TeamRole } from '@/types/team';

// Define simple types to prevent excessive type inference
export type TeamWithRole = {
  id: string;
  name: string;
  role: TeamRole;
  created_at: string;
};

// Simple raw type definitions to avoid complex type inference
type RawTeamMember = {
  team_id: string;
  role: string;
};

type RawTeam = {
  id: string;
  name: string;
  created_at: string;
};

export function useTeams() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['teams', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<TeamWithRole[]> => {
      if (!user) return [];

      // Use type assertion to avoid deep type inference
      const membershipsResult = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', user.id);
        
      if (membershipsResult.error) {
        console.error('Error fetching team memberships:', membershipsResult.error);
        return [];
      }
      
      // Cast to simple type to avoid inference issues
      const memberships = membershipsResult.data as RawTeamMember[];
      
      if (!memberships || memberships.length === 0) return [];
      
      // Extract team IDs and create role mapping
      const teamIds = memberships.map(item => item.team_id);
      const roleMap = new Map(
        memberships.map(item => [item.team_id, item.role])
      );
      
      // Use type assertion for team data as well
      const teamsResult = await supabase
        .from('teams')
        .select('id, name, created_at')
        .in('id', teamIds);
        
      if (teamsResult.error) {
        console.error('Error fetching team details:', teamsResult.error);
        return [];
      }
      
      // Cast to simple type
      const teams = teamsResult.data as RawTeam[];
      
      // Map to final type with explicit role casting
      return teams.map(team => {
        const role = roleMap.get(team.id) || 'viewer';
        return {
          id: team.id,
          name: team.name,
          role: role as TeamRole,
          created_at: team.created_at
        };
      });
    },
  });

  return {
    ...query,
    teams: query.data || []
  };
}
