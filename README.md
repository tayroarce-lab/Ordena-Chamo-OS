# Chamos House

> **A complete digital management system for fast-food restaurants to handle orders, kitchen displays, and financial reports.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](#)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](#)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)](#)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socket.io&logoColor=white)](#)
[![n8n](https://img.shields.io/badge/n8n-FF6600?style=flat-square&logo=n8n&logoColor=white)](#)

---

## The Problem

Fast-food restaurants (like burger joints) often rely on manual paper notes for taking orders and manual calculations for end-of-day cash closing. This leads to human errors, lost orders, lack of real-time visibility for the kitchen staff, and inaccurate financial reports. Existing solutions are either too complex, expensive, or don't integrate well with direct customer channels like WhatsApp.

## The Solution

Chamos House digitizes the entire order flow, from the moment a customer messages on WhatsApp to the final delivery and financial closing. It provides an automated intake via webhooks, a real-time Kitchen Display System (KDS) for cooks to manage orders visually, and an administrative dashboard for tracking sales and best-selling products.

---

## Architecture
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   WhatsApp ──→ n8n Workflow ──→ Webhook (Express API)       │
│                                           │                 │
│                                           ↓                 │
│   Client (React/Vite KDS)  ←── Socket.io  +  MySQL DB       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

The customer interacts with a chatbot (via n8n), which sends a webhook to the Node.js API. The API validates the order, saves it atomically in the MySQL database, and emits a real-time event via Socket.io. The React frontend (KDS) listens to this event and instantly updates the kitchen's Kanban board without refreshing.

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React + Vite + TypeScript + TailwindCSS | Fast development, strong typing, and easy state management (Zustand) for the real-time KDS. |
| Backend | Node.js + Express | Lightweight, fast, and native support for JavaScript/TypeScript and WebSockets. |
| Database | MySQL + Sequelize | Relational integrity for order details, robust transactions for financial data. |
| Realtime | Socket.io | Reliable bidirectional communication for the kitchen display board. |
| Automation | n8n | Easy integration with WhatsApp Business and other external APIs. |

> **Design decisions worth noting:**  
> — **Strict Layered Architecture (Routes → Controller → Service → Model)** to decouple business logic from HTTP transport, making it easier to test and maintain.
> — **Historical Data Integrity:** The `detalle_pedidos` table stores the exact product price at the time of purchase (`p_unitario`) to prevent past financial reports from changing if a product's price is updated in the future.

---

## Key Features

- **Automated Order Intake** — Receives structured orders directly from chatbots (like WhatsApp via n8n) and processes them instantly.
- **Real-Time Kitchen Display System (KDS)** — A live Kanban board for cooks with drag-and-drop functionality to move orders through stages (`pendiente` → `en_proceso` → `listo` → `entregado`).
- **Financial & Operational Reporting** — Generates end-of-day reports including total revenue by payment method and top-selling products.
- **Menu & User Management** — Full CRUD for products (with availability toggles) and staff roles (Admin/Kitchen).

---

## Getting Started

### Prerequisites

```bash
node >= 20
mysql >= 8
npm >= 10
```

### Installation

```bash
# Clone the repository
git clone https://github.com/tayroarce-lab/chamos_FastFlow-OS.git
cd chamos_FastFlow-OS/chamos-house

# Setup Backend
cd backend
npm install
cp ../.env.example .env
# Edit .env with your database credentials (DB_USER, DB_PASSWORD, etc.)

# Create the database in MySQL:
# CREATE DATABASE chamos_house CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Run migrations and seed data
npm run seed

# Start backend server
npm run dev

# Setup Frontend (in a new terminal)
cd ../frontend
npm install
# Create frontend/.env and add: VITE_API_URL=http://localhost:3001
npm run dev
```

### Environment Variables

**Backend (`backend/.env`)**
| Variable | Description | Required |
|---|---|---|
| `DB_NAME` | MySQL database name (`chamos_house`) | ✅ |
| `DB_USER` / `DB_PASSWORD` | MySQL credentials | ✅ |
| `JWT_SECRET` | Secret for token signing | ✅ |
| `WEBHOOK_SECRET` | Secret for verifying external requests (e.g. from n8n) | ✅ |
| `PORT` | API server port (default: 3001) | ❌ |

---

## API Reference

Base URL: `http://localhost:3001/api`

POST   `/api/auth/login`          Authenticate user, returns JWT

POST   `/api/webhooks/pedido`     Create order via webhook (requires `X-Webhook-Secret`)

GET    `/api/pedidos`             List all orders (with pagination and filters)

GET    `/api/pedidos/activos`     Get active orders for KDS

PATCH  `/api/pedidos/:id/estado`  Update order status

GET    `/api/productos`           List all products (Admin)

GET    `/api/reportes/ventas`     Get sales reports (daily/weekly/monthly)

---

## Project Structure
chamos-house/
├── backend/src/
│   ├── config/          # DB connection, env validation
│   ├── controllers/     # Route handlers (thin layer, no business logic)
│   ├── middlewares/     # Auth, error handling, validation
│   ├── models/          # Sequelize models (Usuario, Pedido, Producto)
│   ├── routes/          # Express route definitions
│   ├── services/        # Core business logic and transactions
│   └── socket/          # Socket.io namespace and event managers
└── frontend/src/
    ├── components/      # Reusable UI elements (KDSColumn, PedidoCard)
    ├── hooks/           # Custom React hooks (useKitchenSocket, useTickingTime)
    ├── pages/           # Main views (KDSBoard, Dashboard)
    ├── services/        # Encapsulated API calls
    └── types/           # TypeScript interfaces

---

## What I'd Improve Next

- [ ] Add integration tests for the webhook to order flow (currently only unit tests).
- [ ] Implement a notification system for clients when their order reaches the `listo` (ready) state.
- [ ] Dockerize the entire application (Backend, Frontend, and MySQL) for easier single-command deployment via `docker-compose`.

---

## Author

**Tayro Arce**  
Full Stack Developer · AI Automation Engineer  
[tayroarce@gmail.com](mailto:tayroarce@gmail.com)
