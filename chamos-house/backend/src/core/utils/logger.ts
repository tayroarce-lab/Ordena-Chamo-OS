import fs from 'fs';
import path from 'path';
import winston from 'winston';
import { isDevelopment } from '../../config/env';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const { combine, timestamp, printf, colorize, json } = winston.format;

const devFormat = printf(({ level, message, timestamp: ts, stack }) => {
  const base = `${ts} [${level}]: ${message}`;
  return stack ? `${base}\n${stack}` : base;
});

export const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: combine(timestamp(), isDevelopment ? colorize() : json(), devFormat),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

export const morganStream = {
  write: (message: string): void => {
    logger.info(message.trim());
  },
};
