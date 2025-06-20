import { z } from 'zod';

export const teamSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Team name is required'),
  city: z.string().min(1, 'City is required'),
  code: z.string().length(3, 'Code must be exactly 3 characters'),
  conference: z.enum(['East', 'West'], {
    required_error: 'Conference must be either East or West',
  }),
  division: z.string().min(1, 'Division is required'),
  logoUrl: z.string().url('Logo URL must be a valid URL').optional(),
});
