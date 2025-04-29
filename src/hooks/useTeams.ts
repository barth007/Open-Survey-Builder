
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

// Definisco tipi semplici per evitare problemi di inferenza di tipo eccessivamente profondi
export type TeamWithRole = {
  id: string;
  name: string;
  role: 'owner' | 'editor' | 'viewer';
  created_at: string;
};

// Tipi ausiliari per il processamento dei dati
type TeamMembershipRaw = {
  team_id: string;
  role: string;
};

type TeamDataRaw = {
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

      // Evito inferenza di tipo utilizzando una struttura semplificata
      const membershipsResponse = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', user.id);
        
      if (membershipsResponse.error) {
        console.error('Error fetching team memberships:', membershipsResponse.error);
        return [];
      }
      
      // Utilizzo una conversione di tipo diretta per evitare problemi di inferenza
      const memberships = membershipsResponse.data as unknown as TeamMembershipRaw[];
      
      if (!memberships || memberships.length === 0) return [];
      
      // Ottengo gli ID dei team e una mappa per i ruoli
      const teamIds = memberships.map(item => item.team_id);
      const roleMap = new Map(
        memberships.map(item => [item.team_id, item.role])
      );
      
      // Recupero i dettagli dei team con lo stesso approccio semplificato
      const teamsResponse = await supabase
        .from('teams')
        .select('id, name, created_at')
        .in('id', teamIds);
        
      if (teamsResponse.error) {
        console.error('Error fetching team details:', teamsResponse.error);
        return [];
      }
      
      // Conversione diretta a un tipo semplificato
      const teams = teamsResponse.data as unknown as TeamDataRaw[];
      
      // Combino i dati con conversione di tipo sicura
      return teams.map(team => {
        const role = roleMap.get(team.id) || 'viewer';
        return {
          id: team.id,
          name: team.name,
          role: role as 'owner' | 'editor' | 'viewer',
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
