const required = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD_HASH',
  'AI_SERVICE_API_KEY',
] as const;

export function validateEnv(config: Record<string, unknown>) {
  for (const key of required) {
    if (!config[key]) {
      throw new Error(`Missing required environment variable ${key}`);
    }
  }

  return config;
}
