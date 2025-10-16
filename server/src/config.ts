import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const schema = z
  .object({
    PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    REDIS_URL: z
      .string()
      .url()
      .optional()
      .transform((value) => (value && value.length > 0 ? value : undefined)),
    CORS_ORIGIN: z.string().min(1).optional(),
  })
  .strict();

const parsed = schema.safeParse({
  PORT: process.env.PORT,
  REDIS_URL: process.env.REDIS_URL,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
});

if (!parsed.success) {
  // Emit the full schema validation issues, then terminate loudly during boot
  console.error('Invalid server configuration', parsed.error.flatten());
  process.exit(1);
}

const { PORT, REDIS_URL, CORS_ORIGIN } = parsed.data;

export const appConfig = {
  port: PORT,
  redisUrl: REDIS_URL,
  corsOrigin: CORS_ORIGIN ?? '*',
};
