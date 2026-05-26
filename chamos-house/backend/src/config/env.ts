import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`Variable de entorno requerida faltante: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

function parseIntEnv(key: string, defaultValue: number): number {
  const raw = process.env[key];
  if (!raw) return defaultValue;
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

export const env = {
  nodeEnv: optionalEnv('NODE_ENV', 'development'),
  port: parseIntEnv('PORT', 3001),
  db: {
    host: optionalEnv('DB_HOST', 'localhost'),
    port: parseIntEnv('DB_PORT', 3306),
    name: requireEnv('DB_NAME'),
    user: requireEnv('DB_USER'),
    password: process.env.DB_PASSWORD ?? '',
    poolMax: parseIntEnv('DB_POOL_MAX', 10),
    poolMin: parseIntEnv('DB_POOL_MIN', 2),
  },
  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiresIn: optionalEnv('JWT_EXPIRES_IN', '8h'),
    refreshExpiresIn: optionalEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  },
  frontendUrl: optionalEnv('FRONTEND_URL', 'http://localhost:5173'),
  webhookSecret: requireEnv('WEBHOOK_SECRET'),
  rateLimit: {
    windowMs: parseIntEnv('RATE_LIMIT_WINDOW_MS', 900_000),
    max: parseIntEnv('RATE_LIMIT_MAX', 100),
  },
} as const;

export const isDevelopment = env.nodeEnv === 'development';
export const isProduction = env.nodeEnv === 'production';
