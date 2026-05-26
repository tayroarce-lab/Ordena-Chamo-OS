# 🍔 Chamos House — Contexto Completo del Proyecto SaaS

> **Documento de referencia para IA / Agentes de desarrollo.**
> Este archivo contiene toda la información necesaria para entender, planificar y
> generar código coherente para el sistema. Debe ser leído en su totalidad antes
> de producir cualquier artefacto de código.

---

## 1. Visión General del Producto

**Nombre:** Chamos House
**Tipo:** SaaS "Todo en Uno" para restaurante de comida rápida (estilo McDonald's)
**Objetivo de negocio:** Eliminar por completo el uso de libretas manuales y la
contabilidad manual al cierre del día, digitalizando y automatizando el flujo
completo de pedidos desde la toma del pedido hasta la entrega y el reporte financiero.

**Problema que resuelve:**
- Los pedidos se toman manualmente en papel → errores humanos, pedidos perdidos.
- El cierre de caja es manual → tiempo, imprecisión, sin histórico digital.
- La cocina no tiene visibilidad en tiempo real del estado de los pedidos.
- No hay métricas de negocio: productos más vendidos, ingresos por método de pago, etc.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión objetivo |
|---|---|---|
| **Backend** | Node.js + Express | LTS actual |
| **Lenguaje** | TypeScript | 5.x |
| **ORM** | Sequelize | v6 |
| **Base de datos** | MySQL (producción)   MySQL 8 |
| **Tiempo real** | Socket.io | v4 |
| **Frontend** | React + TypeScript + Vite | React 18 |
| **Automatización** | n8n (self-hosted) | latest |
| **Entrada cliente** | WhatsApp Business via n8n | — |

### Convenciones de código obligatorias
- Nombres de tablas y columnas: **snake_case minúsculas** (para compatibilidad MySQL → PostgreSQL).
- Arquitectura backend en capas: `Routes → Controller → Service → Model`.
- Nunca lógica de negocio en controladores; siempre en la capa `Service`.
- TypeScript con `strict: true`. Prohibido el uso de `any` explícito.
- Errores siempre con estructura: `{ success: false, error: string, details?: unknown }`.

---

## 3. Diagrama Entidad-Relación (E-R)

> Fuente: diagrama oficial del proyecto (imagen adjunta en el repositorio).

### 3.1 Relaciones

```
usuarios (1) ──────────── (*) pedidos
pedidos  (1) ──────────── (*) detalle_pedidos
productos (1) ─────────── (*) detalle_pedidos
```

### 3.2 Definición de Tablas

#### Tabla: `usuarios`
| Campo | Tipo sugerido | Restricción | Notas |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | — |
| `telefono` | VARCHAR(20) | UNIQUE, NOT NULL | Identificador único real del cliente |
| `nombre` | VARCHAR(100) | NULL | Nombre capturado por el chatbot |
| `rol` | ENUM | NOT NULL | `'cliente'`, `'cocina'`, `'admin'` |
| `f_creacion` | DATETIME | NOT NULL | `DEFAULT NOW()` |

> **Nota de diseño:** El campo `telefono` actúa como el identificador de negocio
> del cliente. El flujo de `findOrCreate` en el backend siempre busca por este campo.
> El campo `rol` permite escalar el sistema para que los usuarios de cocina y admin
> puedan autenticarse en el futuro.

---

#### Tabla: `pedidos`
| Campo | Tipo sugerido | Restricción | Notas |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | — |
| `usuario_id` | INT | FK → usuarios.id, NOT NULL | — |
| `estado` | ENUM | NOT NULL, DEFAULT `'pendiente'` | Ver ciclo de vida abajo |
| `metodo_pago` | ENUM | NOT NULL | `'efectivo'`, `'tarjeta'`, `'transferencia'`, `'zelle'` |
| `total` | DECIMAL(10,2) | NOT NULL | Calculado en el backend, nunca en el frontend |
| `f_creacion` | DATETIME | NOT NULL | `DEFAULT NOW()` |

**Ciclo de vida del estado del pedido:**
```
pendiente → en_proceso → listo → entregado
```
- `pendiente`: Recién llegado del chatbot. Aparece en la columna KDS izquierda.
- `en_proceso`: El cocinero lo aceptó y está preparándolo.
- `listo`: Listo para recoger/entregar. Notificación al cliente (futuro).
- `entregado`: Ciclo completo. Contabilizado en reportes.

> **Regla de negocio:** Solo los pedidos con estado `'entregado'` se incluyen
> en los reportes financieros de cierre.

---

#### Tabla: `productos`
| Campo | Tipo sugerido | Restricción | Notas |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | — |
| `nombre` | VARCHAR(150) | NOT NULL | Nombre visible en el menú/chatbot |
| `precio` | DECIMAL(10,2) | NOT NULL | Precio base del producto |
| `categoria` | VARCHAR(80) | NULL | Ej: `'hamburguesas'`, `'bebidas'`, `'combos'` |
| `disponible` | BOOLEAN | DEFAULT TRUE | Para activar/desactivar del menú sin borrar |

---

#### Tabla: `detalle_pedidos`
| Campo | Tipo sugerido | Restricción | Notas |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | — |
| `pedido_id` | INT | FK → pedidos.id, NOT NULL | — |
| `producto_id` | INT | FK → productos.id, NOT NULL | — |
| `cantidad` | INT | NOT NULL, DEFAULT 1 | — |
| `p_unitario` | DECIMAL(10,2) | NOT NULL | Precio al momento de la compra (snapshot) |
| `modificadores` | JSON | NULL | Extras/modificaciones del ítem |

> **Nota crítica sobre `p_unitario`:** Este campo guarda el precio del producto
> **en el momento de la compra**, no una referencia al precio actual. Esto protege
> los reportes históricos ante cambios de precio futuros en la tabla `productos`.

> **Nota sobre `modificadores`:** Tipo `DataTypes.JSON`. Estructura de ejemplo:
> ```json
> { "sin_cebolla": true, "extra_queso": true, "termino": "bien_cocido" }
> ```
> Tipado TypeScript: `Record<string, unknown> | null`

---

## 4. Flujo de Trabajo del Negocio (End-to-End)

```
[Cliente WhatsApp]
       │
       │ Interactúa con chatbot
       ▼
[n8n Workflow]
       │
       │ HTTP POST /api/webhooks/pedido
       │ { telefono, nombre, metodo_pago, items: [...] }
       ▼
[Backend Express]
       │
       ├─ 1. Valida payload (express-validator)
       ├─ 2. findOrCreate usuario por telefono
       ├─ 3. Consulta precios reales de productos (no confiar en payload)
       ├─ 4. Abre transacción Sequelize
       │     ├─ INSERT pedidos
       │     └─ INSERT detalle_pedidos (por cada ítem)
       ├─ 5. COMMIT → éxito
       │     └─ Si falla cualquier paso → ROLLBACK total
       ├─ 6. socket.to('/cocina').emit('nuevo_pedido', pedidoCompleto)
       └─ 7. Responde a n8n: { success: true, pedido_id: X }
              │
              ▼
[Socket.io Server]
       │
       │ Emite evento 'nuevo_pedido' al namespace /cocina
       ▼
[React KDS — Pantalla de Cocina]
       │
       ├─ useKitchenSocket() escucha el evento
       ├─ Agrega el pedido al array 'pendiente' (inmutablemente)
       └─ Renderiza PedidoCard en la columna correspondiente

[Cocinero presiona botón de estado]
       │
       │ PATCH /api/pedidos/:id/estado
       ▼
[Backend Express]
       │
       ├─ UPDATE pedidos SET estado = 'en_proceso' WHERE id = X
       └─ socket.emit('pedido_actualizado', { pedidoId, nuevoEstado })
              │
              ▼
[React KDS — Todos los clientes conectados]
       └─ Mueven la tarjeta a la columna correcta (sin recargar)
```

---

## 5. Arquitectura de Reportes

**Endpoint:** `GET /api/reportes?periodo=dia|semana|mes&fecha=YYYY-MM-DD`

Las 3 consultas se ejecutan en paralelo con `Promise.all()`:

### Consulta A — Resumen Financiero
- `COUNT(*)` → total de pedidos entregados
- `SUM(total)` → ingresos totales
- `GROUP BY metodo_pago` → desglose por método de pago
- Filtro: `estado = 'entregado'` + `f_creacion BETWEEN startDate AND endDate`

### Consulta B — Top Productos Más Vendidos
- JOIN `detalle_pedidos` + `productos` + `pedidos` (para el filtro de fecha)
- `SUM(cantidad)` AS `total_vendido`
- `SUM(p_unitario * cantidad)` AS `ingresos_generados`
- `GROUP BY producto_id`
- `ORDER BY total_vendido DESC LIMIT 10`

### Consulta C — Estado Operativo del Día
- `COUNT(*) GROUP BY estado` en pedidos de hoy
- Sin filtro de estado (todos los estados visibles)

---

## 6. Arquitectura Frontend — KDS (Kitchen Display System)

### Estructura de estado
```typescript
interface KDSState {
  pendiente:   Pedido[];
  en_proceso:  Pedido[];
  listo:       Pedido[];
  entregado:   Pedido[]; // Solo últimas 2 horas
}
```

### Árbol de componentes
```
KDSBoard.tsx          ← Página principal, gestiona el estado global del KDS
├── KDSColumn.tsx     ← Una columna por estado (x4)
│   └── PedidoCard.tsx ← Tarjeta individual de pedido
│       ├── ItemList  ← Lista de productos con modificadores
│       └── ActionButton ← Solo muestra la transición válida siguiente
└── ReportePanel.tsx  ← Panel lateral con métricas en tiempo real (futuro)
```

### Hooks personalizados
- `useKitchenSocket()` → Maneja conexión Socket.io, eventos y actualizaciones de estado.
- `useTickingTime(f_creacion)` → Calcula tiempo transcurrido desde el pedido, actualiza cada minuto.

---

## 7. Estructura de Directorios del Proyecto

```
chamos-house/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts          # Instancia Sequelize con pool
│   │   ├── models/
│   │   │   ├── Usuario.ts
│   │   │   ├── Producto.ts
│   │   │   ├── Pedido.ts
│   │   │   ├── DetallePedido.ts
│   │   │   └── index.ts             # Centraliza modelos y asociaciones
│   │   ├── controllers/
│   │   │   ├── webhookController.ts
│   │   │   └── reporteController.ts
│   │   ├── services/
│   │   │   ├── pedidoService.ts
│   │   │   └── reporteService.ts
│   │   ├── routes/
│   │   │   ├── webhookRoutes.ts
│   │   │   └── reporteRoutes.ts
│   │   ├── middlewares/
│   │   │   └── validatePedido.ts    # express-validator rules
│   │   ├── socket/
│   │   │   └── socketManager.ts     # Singleton Socket.io
│   │   └── utils/
│   │       └── dateRangeHelper.ts
│   ├── tsconfig.json
│   └── package.json
│
└── frontend/
    └── src/
        ├── hooks/
        │   ├── useKitchenSocket.ts
        │   └── useTickingTime.ts
        ├── types/
        │   └── pedido.types.ts
        ├── pages/
        │   └── KDSBoard.tsx
        ├── components/
        │   ├── KDSColumn.tsx
        │   └── PedidoCard.tsx
        └── services/
            └── pedidoApiService.ts  # Toda la comunicación HTTP encapsulada
```

---

## 8. Reglas de Negocio Críticas (No negociables)

1. **Los precios NUNCA vienen del payload de n8n.** El backend siempre consulta
   la BD para obtener el precio actual del producto y lo guarda como snapshot en
   `detalle_pedidos.p_unitario`.

2. **Atomicidad total en la creación de pedidos.** Si falla la inserción de
   cualquier `detalle_pedido`, se hace rollback de todo. Nunca debe existir un
   pedido sin sus detalles en la BD.

3. **El campo `total` en `pedidos` lo calcula el backend**, sumando
   `p_unitario * cantidad` de cada ítem. Nunca confiar en el total enviado por n8n.

4. **Solo pedidos `entregado` cuentan en reportes financieros.** Los pedidos
   en cualquier otro estado no se incluyen en los cálculos de ingresos.

5. **Las transiciones de estado son unidireccionales y ordenadas:**
   `pendiente → en_proceso → listo → entregado`. No se puede retroceder.

6. **Socket.io usa el namespace `/cocina`** para aislar los eventos del KDS
   del resto de posibles eventos futuros del sistema.

---

## 9. Payload de n8n → Backend (Referencia)

```json
{
  "telefono": "50688887777",
  "nombre_cliente": "Juan Pérez",
  "metodo_pago": "efectivo",
  "notas": "Sin cebolla en la hamburguesa",
  "items": [
    {
      "producto_id": 3,
      "cantidad": 2,
      "modificadores": { "sin_cebolla": true, "extra_queso": true }
    },
    {
      "producto_id": 7,
      "cantidad": 1,
      "modificadores": null
    }
  ]
}
```

**Respuesta esperada al webhook:**
```json
{
  "success": true,
  "pedido_id": 42,
  "mensaje": "Pedido recibido correctamente"
}
```

---

## 10. Evento Socket.io — Estructura de Datos

### `nuevo_pedido` (Server → KDS)
```typescript
{
  pedido_id: number;
  usuario: { id: number; nombre: string; telefono: string };
  estado: 'pendiente';
  metodo_pago: string;
  total: number;
  f_creacion: string; // ISO 8601
  items: Array<{
    detalle_id: number;
    producto: { id: number; nombre: string; categoria: string };
    cantidad: number;
    p_unitario: number;
    modificadores: Record<string, unknown> | null;
  }>;
}
```

### `pedido_actualizado` (Server → KDS)
```typescript
{
  pedido_id: number;
  estado_anterior: EstadoPedido;
  nuevo_estado: EstadoPedido;
  updated_at: string; // ISO 8601
}
```

---

*Última actualización del documento: generado durante la fase de inicialización del proyecto.*
*Versión del diagrama E-R: v1.0 (imagen de referencia adjunta en el repositorio).*