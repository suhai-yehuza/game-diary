import { teamSchema, type TeamInput } from '@/lib/types/validation.types';

export const validateTeam = (team: unknown): TeamInput => {
  return teamSchema.parse(team);
};
