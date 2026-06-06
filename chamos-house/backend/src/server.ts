import { createServer } from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { testConnection, sequelize } from './config/database';
import './models';
import { socketManager } from './socket/socketManager';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
  try {
    await testConnection();
    await sequelize.sync({ alter: true });
    logger.info('Modelos sincronizados con la base de datos');

    const app = createApp();
    const httpServer = createServer(app);

    socketManager.initializeSocket(httpServer);

    httpServer.listen(env.port, () => {
      logger.info(`Servidor Chamos House API en http://localhost:${env.port}`);
    });
  } catch (err) {
    logger.error('Error crítico durante el inicio', {
      err,
      stack: err instanceof Error ? err.stack : undefined,
    });
    console.error(err);
    process.exit(1);
  }
}

void bootstrap();
