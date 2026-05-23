import { env } from './env';

export const jwtConfig = {
  secret: env.jwt.secret,
  expiresIn: env.jwt.expiresIn,
  refreshExpiresIn: env.jwt.refreshExpiresIn,
} as const;
