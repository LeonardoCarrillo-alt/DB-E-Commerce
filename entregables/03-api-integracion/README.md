# API de Integración MongoDB ↔ PostgreSQL

Este directorio contiene los scripts para demostrar la integración y
sincronización de datos entre MongoDB y PostgreSQL a través de la API Gateway.

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `api-demo.http` | Archivo para VS Code REST Client. Permite ejecutar cada paso del flujo de integración de forma interactiva. |
| `api-demo.sh` | Script bash autónomo. Ejecuta el flujo completo de integración automáticamente. |

## Flujo demostrado

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLUJO DE INTEGRACIÓN                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Login      → PostgreSQL valida credenciales (BCrypt)          │
│                   → JWT con sub=usuario.id (UUID PostgreSQL)      │
│                                                                   │
│  2. Catálogo   → MongoDB: productos con atributos BSON            │
│                                                                   │
│  3. Búsqueda   → MongoDB: $gte, $lte, $and, $or en atributos     │
│                                                                   │
│  4. Carrito    → MongoDB: carrito.usuarioId = UUID PostgreSQL     │
│                                                                   │
│  5. Checkout   → MongoDB: reserva stock (inventario)              │
│                                                                   │
│  6. Orden      → POSTGRESQL: crea Pedido (UUID)                  │
│               → MONGODB: confirma reserva (orderId = UUID PG)     │
│                                                                   │
│  7. Migración  → Invitado: carrito con sessionId (UUID v4)       │
│   invitado     → Autenticado: fusiona carritos en MongoDB         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Puntos clave de integración

| Paso | DB Origen | DB Destino | Dato compartido |
|------|-----------|------------|-----------------|
| Login | PostgreSQL | — | `Usuario.id` (UUID) en JWT `sub` |
| Carrito | — | MongoDB | `carrito.usuario_id` = UUID de PostgreSQL |
| Checkout | MongoDB | MongoDB | `reservaId` = `UUID.randomUUID()` |
| Crear orden | MongoDB → PostgreSQL | PostgreSQL | `Pedido.id` = UUID auto-generado |
| Confirmar stock | PostgreSQL → MongoDB | MongoDB | `confirmarCompra(orderId)` = UUID de PostgreSQL |
| Migración invitado | MongoDB | MongoDB | `sessionId` → `usuarioId` (UUID) |

## Requisitos

- **Para api-demo.http:** VS Code con extensión "REST Client"
- **Para api-demo.sh:** `curl`, `jq`, y permisos de ejecución
- Servicios ejecutándose: `docker-compose up -d`

## Ejecución

### Script bash
```bash
chmod +x api-demo.sh
./api-demo.sh
```

### HTTP (VS Code)
Abrir `api-demo.http` y hacer clic en "Send Request" en cada paso.
