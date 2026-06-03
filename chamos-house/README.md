# 🍔 Chamos House — Sistema de Gestión de Restaurante

Sistema fullstack para gestión de pedidos de restaurante de comida rápida. Incluye un flujo de pedidos vía webhook (integrable con n8n/WhatsApp), panel de cocina en tiempo real (**KDS** con drag & drop), gestión de productos y usuarios, y reportes financieros.

---

## 📐 Arquitectura

```
chamos-house/
├── backend/     # API REST + WebSockets (Node.js, Express, Sequelize, MySQL)
└── frontend/    # SPA React + Vite (TypeScript, TailwindCSS, Zustand)
```

### Stack tecnológico

| Capa       | Tecnología                                                  |
|------------|-------------------------------------------------------------|
| Backend    | Node.js 20+, Express 4, TypeScript, Sequelize 6, Socket.io  |
| Base de datos | MySQL 8                                                  |
| Frontend   | React 18, Vite, TypeScript, TailwindCSS 3, Zustand, Recharts|
| DnD        | @hello-pangea/dnd                                           |
| Auth       | JWT (access token en cookie httpOnly)                       |
| Tiempo real| Socket.io (namespace `/cocina`)                             |

---

## ✅ Requisitos previos

- **Node.js** 20 o superior → https://nodejs.org
- **MySQL** 8 corriendo localmente (o en Docker)
- **npm** 10+ (incluido con Node.js)
- Git

---

## 🚀 Instalación y puesta en marcha

### 1. Clonar el repositorio

```bash
git clone https://github.com/tayroarce-lab/chamos_FastFlow-OS.git
cd chamos_FastFlow-OS/chamos-house
```

### 2. Configurar el backend

```bash
cd backend
cp ../.\env.example .env
```

Edita `backend/.env` con tus credenciales:

```env
NODE_ENV=development
PORT=3001

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=chamos_house
DB_USER=root
DB_PASSWORD=tu_password_aqui
DB_POOL_MAX=10
DB_POOL_MIN=2

# JWT — genera un string aleatorio de 64 chars
JWT_SECRET=CAMBIA_ESTE_VALOR_POR_UNO_LARGO_Y_ALEATORIO
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173

# Webhook (para n8n o llamadas externas)
WEBHOOK_SECRET=CAMBIA_ESTE_WEBHOOK_SECRET

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

#### Crear la base de datos en MySQL

```sql
CREATE DATABASE chamos_house CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Instalar dependencias y ejecutar seeders

```bash
npm install
npm run seed   # Crea las tablas y carga datos iniciales (admin, cocina, productos de ejemplo)
npm run dev    # Inicia el servidor en http://localhost:3001
```

---

### 3. Configurar el frontend

```bash
cd ../frontend
```

Crea el archivo `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
```

```bash
npm install
npm run dev   # Inicia la app en http://localhost:5173
```

---

## 🔑 Credenciales iniciales (generadas por el seeder)

| Rol    | Teléfono      | Contraseña  | Acceso                        |
|--------|---------------|-------------|-------------------------------|
| Admin  | 00000000000   | Admin123!   | Todas las rutas               |
| Cocina | 11111111111   | Cocina123!  | Solo `/cocina` (KDS)          |

---

## 🗂 Funcionalidades principales

### 👨‍🍳 Cocina — KDS (`/cocina`)
- Tablero Kanban en tiempo real con 4 columnas: **Pendiente → En proceso → Listo → Entregado**
- **Drag & Drop** en toda la tarjeta para cambiar el estado de un pedido
- Botones de avance (→) y **retroceso (←)** por estado
- Crear pedido manual directamente desde cocina
- Conexión vía **WebSocket** para recibir nuevos pedidos en tiempo real
- Indicador de tiempo transcurrido por pedido (urgente si ≥ 15 min)

### 📋 Pedidos (`/pedidos`)
- Tabla de historial con paginación
- Filtros por estado, método de pago y rango de fechas
- Ver detalle de cada pedido
- Crear pedido manual

### 📦 Productos (`/productos`)
- CRUD completo de productos
- Toggle de disponibilidad
- Categorías personalizadas

### 👥 Usuarios (`/usuarios`)
- Gestión de usuarios del staff (admin / cocina)
- Solo visible para el rol `admin`

### 📊 Dashboard (`/dashboard`)
- Reportes de ventas por período (día / semana / mes)
- Gráficos con Recharts

---

## 🔌 API REST — Referencia rápida

Base URL: `http://localhost:3001/api`

### Autenticación

| Método | Ruta           | Descripción              | Auth |
|--------|----------------|--------------------------|------|
| POST   | `/auth/login`  | Login, retorna JWT       | No   |
| GET    | `/auth/me`     | Obtener usuario actual   | Sí   |
| POST   | `/auth/logout` | Cerrar sesión            | Sí   |

### Pedidos

| Método | Ruta                    | Descripción                      | Roles          |
|--------|-------------------------|----------------------------------|----------------|
| GET    | `/pedidos`              | Historial (filtros + paginación) | admin, cocina  |
| GET    | `/pedidos/activos`      | Pedidos activos para KDS         | admin, cocina  |
| GET    | `/pedidos/:id`          | Detalle de un pedido             | admin, cocina  |
| POST   | `/pedidos`              | Crear pedido manualmente         | admin, cocina  |
| PATCH  | `/pedidos/:id/estado`   | Actualizar estado del pedido     | admin, cocina  |

### Webhook (para n8n/WhatsApp)

| Método | Ruta                      | Descripción              | Auth Header             |
|--------|---------------------------|--------------------------|-------------------------|
| POST   | `/webhooks/pedido`        | Crear pedido vía webhook | `X-Webhook-Secret: ...` |

**Payload del webhook:**
```json
{
  "telefono": "50688887777",
  "nombre_cliente": "Juan Pérez",
  "metodo_pago": "efectivo",
  "notas": "Sin cebolla",
  "items": [
    { "producto_id": 1, "cantidad": 2, "modificadores": { "sin_cebolla": true } }
  ]
}
```

**Métodos de pago válidos:** `efectivo` | `tarjeta` | `transferencia` | `sinpe_movil`

### Productos

| Método | Ruta                        | Descripción                    | Roles |
|--------|-----------------------------|--------------------------------|-------|
| GET    | `/productos/publico`        | Listar disponibles (sin auth)  | —     |
| GET    | `/productos`                | Listar todos                   | admin |
| POST   | `/productos`                | Crear producto                 | admin |
| PUT    | `/productos/:id`            | Actualizar producto            | admin |
| PATCH  | `/productos/:id/disponible` | Toggle disponibilidad          | admin |
| DELETE | `/productos/:id`            | Eliminar producto              | admin |

### Usuarios

| Método | Ruta              | Descripción        | Roles |
|--------|-------------------|--------------------|-------|
| GET    | `/usuarios`       | Listar usuarios    | admin |
| POST   | `/usuarios`       | Crear usuario      | admin |
| PUT    | `/usuarios/:id`   | Actualizar usuario | admin |
| DELETE | `/usuarios/:id`   | Eliminar usuario   | admin |

### Reportes

| Método | Ruta                  | Descripción           | Roles |
|--------|-----------------------|-----------------------|-------|
| GET    | `/reportes/ventas`    | Reporte de ventas     | admin |

---

## 🔄 WebSockets — Namespace `/cocina`

El frontend se conecta automáticamente al namespace `/cocina` con un token JWT en el handshake.

| Evento emitido por el servidor | Descripción                     |
|--------------------------------|---------------------------------|
| `nuevo_pedido`                 | Nuevo pedido creado             |
| `pedido_actualizado`           | Estado de un pedido cambiado    |

---

## 📜 Scripts disponibles

### Backend (`/backend`)

| Comando           | Descripción                              |
|-------------------|------------------------------------------|
| `npm run dev`     | Servidor de desarrollo con hot-reload    |
| `npm run build`   | Compilar TypeScript a `/dist`            |
| `npm run start`   | Ejecutar la versión compilada            |
| `npm run seed`    | Sincronizar BD y cargar datos iniciales  |

### Frontend (`/frontend`)

| Comando           | Descripción                              |
|-------------------|------------------------------------------|
| `npm run dev`     | Dev server en `http://localhost:5173`    |
| `npm run build`   | Build de producción en `/dist`           |
| `npm run preview` | Preview del build de producción          |
| `npm run lint`    | Lint con ESLint                          |

---

## 🗃 Modelos de base de datos

```
usuarios
  id, telefono (único), nombre, rol (cliente|cocina|admin), password, activo, f_creacion

productos
  id, nombre, descripcion, precio, categoria, disponible, f_creacion

pedidos
  id, usuario_id → usuarios.id, estado, metodo_pago, total, notas, f_creacion

detalle_pedido
  id, pedido_id → pedidos.id, producto_id → productos.id, cantidad, p_unitario, modificadores (JSON)
```

---

## 🔄 Transiciones de estado de pedidos

Los pedidos siguen un flujo lineal pero permiten retroceder:

```
pendiente ──→ en_proceso ──→ listo ──→ entregado
              ←──────────    ←──────
```

- `pendiente` → puede avanzar a `en_proceso`
- `en_proceso` → puede avanzar a `listo` o retroceder a `pendiente`
- `listo` → puede avanzar a `entregado` o retroceder a `en_proceso`
- `entregado` → estado final, no se puede modificar

---

## 🌐 Integración con n8n (WhatsApp → Pedido)

1. Instala [n8n](https://n8n.io) localmente o en la nube.
2. Crea un workflow con el trigger de **WhatsApp Business**.
3. Extrae el número y los ítems del mensaje.
4. Llama al endpoint `POST /api/webhooks/pedido` con el header `X-Webhook-Secret` que definiste en el `.env`.
5. El pedido aparece automáticamente en el KDS de cocina via WebSocket.

---

## 🔐 Variables de entorno — Referencia completa

### `backend/.env`

| Variable               | Requerida | Ejemplo                   | Descripción                        |
|------------------------|-----------|---------------------------|------------------------------------|
| `NODE_ENV`             | ✅        | `development`             | Entorno de ejecución               |
| `PORT`                 | ✅        | `3001`                    | Puerto del servidor                |
| `DB_HOST`              | ✅        | `localhost`               | Host MySQL                         |
| `DB_PORT`              | ✅        | `3306`                    | Puerto MySQL                       |
| `DB_NAME`              | ✅        | `chamos_house`            | Nombre de la base de datos         |
| `DB_USER`              | ✅        | `root`                    | Usuario MySQL                      |
| `DB_PASSWORD`          | ✅        | `password`                | Contraseña MySQL                   |
| `DB_POOL_MAX`          | ⚙️        | `10`                      | Máximo de conexiones en pool       |
| `DB_POOL_MIN`          | ⚙️        | `2`                       | Mínimo de conexiones en pool       |
| `JWT_SECRET`           | ✅        | `64-char-random-string`   | Secreto para firmar JWT            |
| `JWT_EXPIRES_IN`       | ⚙️        | `8h`                      | Duración del access token          |
| `JWT_REFRESH_EXPIRES_IN`| ⚙️       | `7d`                      | Duración del refresh token         |
| `FRONTEND_URL`         | ✅        | `http://localhost:5173`   | URL del frontend (CORS)            |
| `WEBHOOK_SECRET`       | ✅        | `random-string`           | Secreto para el endpoint webhook   |
| `RATE_LIMIT_WINDOW_MS` | ⚙️        | `900000`                  | Ventana de rate limit (ms)         |
| `RATE_LIMIT_MAX`       | ⚙️        | `100`                     | Máx. peticiones por ventana        |

### `frontend/.env`

| Variable       | Requerida | Ejemplo                  | Descripción             |
|----------------|-----------|--------------------------|-------------------------|
| `VITE_API_URL` | ✅        | `http://localhost:3001`  | URL base del backend    |
