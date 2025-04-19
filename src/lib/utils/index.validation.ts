import { teamSchema, type TeamInput } from '@/lib/types';

export const validateTeam = (team: unknown): TeamInput => {
  return teamSchema.parse(team);
};
