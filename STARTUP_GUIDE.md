# 🚀 Guía para Ejecutar Chamos FastFlow

## ✅ Requisitos Previos
- Node.js v18+ instalado
- MySQL/MariaDB corriendo en `localhost:3306`
- Base de datos `chamos_house` creada
- Usuario `root` en MySQL

## 📋 Configuración

### Backend

1. **Crear/Verificar archivo `.env` en `backend/`:**
```
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=chamos_house
DB_USER=root
DB_PASSWORD=1234
DB_POOL_MAX=10
DB_POOL_MIN=2
JWT_SECRET=CAMBIA_ESTE_VALOR_POR_UNO_LARGO_Y_ALEATORIO
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
WEBHOOK_SECRET=CAMBIA_ESTE_WEBHOOK_SECRET
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

2. **Instalar dependencias:**
```bash
cd backend
npm install
```

3. **Iniciar servidor Backend:**
```bash
npm run dev
```
✅ Debe mostrar: `Servidor Chamos House API en http://localhost:3001`

### Frontend

1. **Crear/Verificar archivo `.env` en `frontend/`:**
```
VITE_API_URL=http://localhost:3001/api
```

2. **Instalar dependencias:**
```bash
cd frontend
npm install
```

3. **Iniciar servidor Frontend:**
```bash
npm run dev
```
✅ Debe mostrar: `Local: http://localhost:5173`

## 🔗 Acceso

- **Frontend:** http://localhost:5173
- **API Health:** http://localhost:3001/health
- **API Base:** http://localhost:3001/api

## 🛠️ Troubleshooting

### Error: `net::ERR_CONNECTION_REFUSED`
- ❌ El backend no está corriendo
- ✅ Ejecuta `npm run dev` en la carpeta `backend/`

### Error: `VITE_API_URL undefined`
- ❌ Falta el archivo `.env` en `frontend/`
- ✅ Crea `frontend/.env` con `VITE_API_URL=http://localhost:3001/api`

### Error: WebSocket connection failed
- ❌ Backend no está corriendo o CORS mal configurado
- ✅ Verifica que el backend esté corriendo en puerto 3001
- ✅ Verifica que FRONTEND_URL en backend/.env sea `http://localhost:5173`

### Error 404 en rutas
- ❌ Asegúrate que las llamadas incluyan `/api` en la URL
- ✅ Las rutas deben estar bajo `http://localhost:3001/api/*`

## 📊 Verificación

1. Abre tu navegador en http://localhost:5173
2. Verifica que **NO haya errores de conexión** en la consola
3. Si ves errores de red, **reinicia ambos servidores**

## 🔄 Reintentos Automáticos

- El frontend reintentará hasta 3 veces si hay errores de conexión
- Espera a que el backend esté listo antes de acceder al frontend
