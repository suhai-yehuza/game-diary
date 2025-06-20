import type { ITeamValidationInput } from '@src/lib/types';
import { teamSchema } from '@src/lib/validations/team';

export const validateTeam = (team: unknown): ITeamValidationInput => {
  return teamSchema.parse(team);
};
