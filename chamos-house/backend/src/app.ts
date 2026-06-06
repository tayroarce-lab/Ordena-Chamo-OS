import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import morgan from 'morgan';
import { env, isDevelopment, isProduction } from './config/env';
import routes from './routes';
import { generalLimiter } from './middlewares/rateLimiter';
import { notFoundHandler, globalErrorHandler } from './middlewares/error.middleware';
import { morganStream } from './utils/logger';

export function createApp(): express.Application {
  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // Configurar CORS más flexible en desarrollo
  const corsOrigin = isDevelopment ? '*' : env.frontendUrl;
  
  app.use(
    cors({
      origin: corsOrigin,
      credentials: !isDevelopment,
    })
  );

  app.use(hpp());
  app.use(compression());
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  if (isProduction) {
    app.use(morgan('combined', { stream: morganStream }));
  } else if (isDevelopment) {
    app.use(morgan('dev'));
  }

  app.use(generalLimiter);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', server: 'Chamos House API' });
  });

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
