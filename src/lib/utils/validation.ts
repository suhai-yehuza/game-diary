import { teamSchema, type TeamInput } from '@src/lib/validations/team';

export const validateTeam = (team: unknown): TeamInput => {
  return teamSchema.parse(team);
};
