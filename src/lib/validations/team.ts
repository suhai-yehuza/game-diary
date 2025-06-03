import { z } from 'zod';

export const teamSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Team name is required'),
  city: z.string().min(1, 'City is required'),
  abbreviation: z.string().length(3, 'Abbreviation must be exactly 3 characters'),
  conference: z.enum(['East', 'West'], {
    required_error: 'Conference must be either East or West',
  }),
  division: z.string().min(1, 'Division is required'),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Primary color must be a valid hex color'),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Secondary color must be a valid hex color'),
  logoUrl: z.string().url('Logo URL must be a valid URL').optional(),
});

export type TeamInput = z.infer<typeof teamSchema>;
