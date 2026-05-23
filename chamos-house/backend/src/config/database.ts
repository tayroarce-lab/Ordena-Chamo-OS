import { Sequelize } from 'sequelize';
import { env, isDevelopment } from './env';
import { logger } from '../utils/logger';

export const sequelize = new Sequelize(
  env.db.name,
  env.db.user,
  env.db.password,
  {
    host: env.db.host,
    port: env.db.port,
    dialect: 'mysql',
    timezone: '+00:00',
    logging: isDevelopment ? (msg: string) => logger.debug(msg) : false,
    pool: {
      max: env.db.poolMax,
      min: env.db.poolMin,
      acquire: 30_000,
      idle: 10_000,
    },
    define: {
      underscored: true,
    },
  }
);

export async function testConnection(): Promise<void> {
  await sequelize.authenticate();
  logger.info('Conexión a MySQL establecida correctamente');
}
