import { envSchema } from '@/lib/validations/env';

export const env = envSchema.parse(process.env);
