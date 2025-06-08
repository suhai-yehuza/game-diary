import { envSchema } from '@src/lib/validations/env';

export const env = envSchema.parse(process.env);
