# Chamos House

SaaS para restaurante de comida rápida: pedidos vía WhatsApp (n8n), cocina en tiempo real (KDS) y reportes financieros.

## Requisitos

- Node.js 18+
- MySQL 8

## Instalación

```bash
# 1. Clonar y entrar al proyecto
cd chamos-house

# 2. Backend
cd backend
cp .env.example .env
# Editar .env con credenciales MySQL y secretos JWT/WEBHOOK
npm install
# Crear base de datos: CREATE DATABASE chamos_house;
npm run seed
npm run dev

# 3. Frontend (otra terminal)
cd ../frontend
cp .env.example .env
npm install
npm run dev
```

- API: http://localhost:3001
- App: http://localhost:5173

## Credenciales iniciales (seeder)

| Rol   | Teléfono      | Contraseña  |
|-------|---------------|-------------|
| Admin | 00000000000   | Admin123!   |
| Cocina| 11111111111   | Cocina123!  |

## Webhook n8n

```
POST http://localhost:3001/api/webhooks/pedido
Header: X-Webhook-Secret: <WEBHOOK_SECRET del .env>
Content-Type: application/json

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

## Stitch (diseño)

Proyecto de mockups: `6657262445699911480`  
Configura el MCP de Stitch en `.cursor/mcp.json` con `STITCH_API_KEY` para que el agente lea pantallas antes de iterar UI.

## Scripts

| Carpeta   | Comando        | Descripción              |
|-----------|----------------|--------------------------|
| backend   | `npm run dev`  | API + Socket.io          |
| backend   | `npm run seed` | Datos iniciales          |
| frontend  | `npm run dev`  | Vite dev server          |
| frontend  | `npm run build`| Build de producción      |
