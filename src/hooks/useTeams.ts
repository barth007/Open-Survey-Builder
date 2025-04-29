
// This file is causing TypeScript errors and is redundant with useSimpleTeams.ts
// Since we've now transitioned to using useSimpleTeams instead of useTeams,
// we can use a simple re-export to maintain backward compatibility

import { useSimpleTeams, SimpleTeamWithRole } from './useSimpleTeams';

// For backward compatibility 
export type TeamWithRole = SimpleTeamWithRole;

export function useTeams() {
  // Simply re-export the useSimpleTeams hook functionality
  return useSimpleTeams();
}
