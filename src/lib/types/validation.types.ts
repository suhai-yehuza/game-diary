import { z } from 'zod';

export const teamSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
  nickname: z.string().min(1, 'Team nickname is required'),
  city: z.string().min(1, 'City is required'),
  division: z
    .enum(['Atlantic', 'Central', 'Southeast', 'Northwest', 'Pacific', 'Southwest'])
    .optional(),
  conference: z.enum(['East', 'West']),
  primaryColor: z.string().min(1, 'Primary color is required'),
  secondaryColor: z.string().min(1, 'Secondary color is required'),
  logoUrl: z.string().url('Invalid logo URL'),
});

export type TeamInput = z.infer<typeof teamSchema>;
