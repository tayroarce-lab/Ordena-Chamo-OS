import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { sequelize } from './models';
import { socketManager } from './socket/socketManager';

// Importación de Rutas
import webhookRoutes from './routes/webhookRoutes';
import reporteRoutes from './routes/reporteRoutes';
import pedidoRoutes from './routes/pedidoRoutes';

// Inicializar Express
const app = express();
const server = createServer(app);

// Configurar WebSockets
socketManager.init(server);

// Configurar Middlewares Globales
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Para desarrollo en Vite
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
}));
app.use(express.json());

// Registrar los módulos de Rutas
app.use('/api/webhooks', webhookRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/pedidos', pedidoRoutes);

// Endpoint básico de prueba
app.get('/health', (req, res) => res.json({ status: 'ok', server: 'Chamos House API' }));

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    // Autenticar y sincronizar las tablas de la BD si no existen
    // alter: true sincroniza la estructura de forma segura en desarrollo
    await sequelize.sync({ alter: true });
    console.log('[DB] Conectado a la base de datos MySQL (chamos_os) exitosamente.');

    server.listen(PORT, () => {
      console.log(`[Servidor] Express y WebSockets corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[Sistema] Error crítico durante el inicio:', error);
    process.exit(1);
  }
}

bootstrap();
