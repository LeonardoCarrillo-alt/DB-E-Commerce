# Documentación de Arquitectura — Sistema E-commerce Multitienda

## Arquitectura de Persistencia Políglota (SQL + NoSQL)

---

## 1. Diagrama de Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          CLIENTE FRONTEND (React + Vite)                             │
│                            http://localhost:5173                                      │
│                                                                                      │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│   │  Auth    │  │ Productos│  │ Carrito  │  │ Checkout │  │ Órdenes  │  │Busqueda│ │
│   │ Login/Reg│  │ Catálogo │  │ /items   │  │ /procesar│  │ /orders  │  │/buscar │ │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│        │              │              │              │              │              │    │
│        └──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘    │
│                                         │ TODAS las peticiones via HTTP JSON           │
│                                         ▼                                               │
│                              axios baseURL: localhost:8080                              │
└─────────────────────────────────────────┬───────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY (Quarkus)                                          │
│                        mongo-backend — http://localhost:8080                              │
│                                                                                          │
│   ┌──────────────────────────────────────────────────────────────────────────────────┐   │
│   │                      CAPA DE RECURSOS REST                                        │   │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│   │  │AuthResrc │ │ProdResrc │ │CarritoRes│ │InventRes │ │PromoResrc│ │OrderResrc│   │   │
│   │  │/auth     │ │/productos│ │/carrito  │ │/inventario│ │/promo    │ │/orders   │   │   │
│   │  └─────┬────┘ └────┬─────┘ └─────┬────┘ └─────┬─────┘ └─────┬────┘ └──────┬───┘   │   │
│   └────────┼────────────┼──────────────┼────────────┼──────────────┼─────────────┼──────┘   │
│            │            │              │            │              │             │          │
│            ▼            ▼              ▼            ▼              ▼             ▼          │
│   ┌──────────────────────────────────────────────────────────────────────────────────┐   │
│   │                      CAPA DE SERVICIOS                                            │   │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│   │  │AuthService│ │ProdSvc   │ │CartSvc   │ │InventSvc │ │PromoSvc  │ │BusqSvc   │   │   │
│   │  └─────┬────┘ └────┬─────┘ └─────┬────┘ └─────┬─────┘ └─────┬────┘ └────┬─────┘   │   │
│   └────────┼────────────┼──────────────┼────────────┼──────────────┼───────────┼───────┘   │
│            │            │              │            │              │           │           │
│     ┌──────┴──────┐    │              │            │              │           │           │
│     │ REST Clients │    │              │            │              │           │           │
│     │ (MicroProfile)│   │              │            │              │           │           │
│     │ PostgreSQL  │    │              │            │              │           │           │
│     │ Pedidos     │    │              │            │              │           │           │
│     └──────┬──────┘    │              │            │              │           │           │
│            │           ▼              ▼            ▼              ▼           ▼           │
│            │    ┌────────────────────────────────────────────────────────────────────┐    │
│            │    │                   MongoDB Driver (Panache)                         │    │
│            │    │   Colecciones: productos, carritos, inventario, promociones,       │    │
│            │    │                 resenas, historial_busquedas                       │    │
│            │    └────────────────────────────────────────────────────────────────────┘    │
│            │                                                                              │
└────────────┼──────────────────────────────────────────────────────────────────────────────┘
             │
             │ HTTP REST (JSON)
             ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                      POSTGRES BACKEND (Quarkus)                                           │
│                      http://localhost:8082                                                 │
│                                                                                           │
│   ┌───────────────────────────────────────────────────────────────────────────────────┐   │
│   │  REST Resources: /usuarios, /pedidos, /tiendas, /direcciones, /envios, /facturas  │   │
│   │                                                                                   │   │
│   │  ┌───────────────────────────────────────────────────────────────────────────┐    │   │
│   │  │  Service Layer (@Transactional ACID)                                       │    │   │
│   │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌───────┐ │    │   │
│   │  │  │Usuario  │ │Pedido   │ │Tienda   │ │Dirección │ │Factura   │ │Envio  │ │    │   │
│   │  │  │Service  │ │Service  │ │Service  │ │Service   │ │Service   │ │Service│ │    │   │
│   │  │  └─────────┘ └─────────┘ └─────────┘ └──────────┘ └──────────┘ └───────┘ │    │   │
│   │  └───────────────────────────────────────────────────────────────────────────┘    │   │
│   │                                                                                   │   │
│   │  ┌───────────────────────────────────────────────────────────────────────────┐    │   │
│   │  │  Hibernate + Panache + Flyway                                              │    │   │
│   │  │  Entidades JPA con UUID y validaciones Jakarta                              │    │   │
│   │  └───────────────────────────────────────────────────────────────────────────┘    │   │
│   └───────────────────────────────────────────────────────────────────────────────────┘   │
│                                     │                                                     │
│                                     ▼ JDBC                                                 │
│                          ┌─────────────────────┐                                          │
│                          │     PostgreSQL 16     │                                          │
│                          │  Base: ecommerce_db   │                                          │
│                          │  10 tablas (3FN)      │                                          │
│                          │  Tablas:              │                                          │
│                          │  - tiendas            │                                          │
│                          │  - roles (RBAC)       │                                          │
│                          │  - usuarios           │                                          │
│                          │  - usuario_roles      │                                          │
│                          │  - pedidos            │                                          │
│                          │  - detalle_pedido     │                                          │
│                          │  - direcciones        │                                          │
│                          │  - metodos_pago       │                                          │
│                          │  - facturas           │                                          │
│                          │  - envios             │                                          │
│                          └─────────────────────┘                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Flujo de Datos Cross-Database (Checkout)

```
FRONTEND                    MONGO BACKEND                          POSTGRES BACKEND
────────                    ────────────                          ────────────────

1. POST /auth/login                              ──► GET /usuarios/validar
   { email, password }                                ?email=X&password=Y
                                                        │
                                                    BCrypt.verify(password, hash)
                                                        │
                                                   ◄── { id, email, rol, permisos }
                                                        │
   ◄── { accessToken, refreshToken }               Genera JWT
        JWT.sub = usuario.id (UUID)                JWT.claim.email, rol, permisos

2. POST /carrito/items
   Headers: Authorization: Bearer <JWT>
   Body: { productoId, cantidad }
        │
        ├── Lee producto de MongoDB (productos._id)
        ├── Valida stock en MongoDB (inventario)
        ├── Obtiene/crea carrito (carritos)
        │   carrito.usuarioId = JWT.sub (UUID PostgreSQL)
        └── Agrega item al carrito
        │
   ◄── { items, subtotal, total }

3. POST /carrito/checkout/procesar
        │
        ├── Valida stock de todos los items
        ├── Reserva stock (inventario.stockReservado)
        ├── reservaId = UUID.randomUUID()
        └── Retorna { reservaId, carrito, total }

4. POST /orders
   Body: { reservaId, carritoId, direccionEnvio, metodoPago }
        │
        ├── 1. Obtiene carrito de MongoDB ──────────► POST /pedidos
        │                                               │
        │                                           Crea Pedido en PostgreSQL
        │                                           Pedido.id = UUID (auto)
        │                                           Pedido.usuario_id = UUID
        │                                           Pedido.estado = "PENDIENTE"
        │                                           detalle_pedido.producto_id = ObjectId string
        │                                               │
        │                                           ◄── PedidoResponse { id, total }
        │
        ├── 2. Confirma reserva en MongoDB
        │   inventario.confirmarCompra(orderId = Pedido.id UUID)
        │
   ◄── { id, total, estado }
```

---

## 3. Enlace entre Bases de Datos (UUID/GUID)

| MongoDB (Campo) | PostgreSQL (Tabla.Campo) | Tipo |
|----------------|--------------------------|------|
| `producto.tienda_id` | `tiendas.id` | UUID (String en MongoDB) |
| `carrito.usuario_id` | `usuarios.id` | UUID (JWT `sub` claim) |
| `inventario.tienda_id` | `tiendas.id` | UUID (String en MongoDB) |
| `resena.usuario_id` | `usuarios.id` | UUID (String en MongoDB) |
| `promocion.usuarios_especificos[]` | `usuarios.id` | UUID (String[]) |
| `detalle_pedido.producto_id` | `productos._id` | ObjectId (String en PostgreSQL) |
| `historial_busquedas.usuario_id` | `usuarios.id` | UUID (String en MongoDB) |

---

## 4. Políglota Persistence — Justificación

### MongoDB (NoSQL) — Catálogo de Productos
- **Esquema dinámico:** Cada categoría (ropa, electrónica, muebles, adornos,
  utensilios de cocina) tiene atributos específicos en formato BSON.
- **Operadores MongoDB:** `$gte`, `$lte`, `$and`, `$or`, `$in`, `$regex`, `$text`.
- **Arreglos:** Atributos como arreglos (etiquetas, variantes, marcas).

### PostgreSQL (SQL) — Datos Transaccionales
- **3FN:** Tablas normalizadas sin dependencias transitivas.
- **ACID:** `@Transactional` en todas las operaciones de servicio.
- **RBAC:** Roles con permisos en JSONB.
- **BCrypt:** Contraseñas hasheadas con 12 rondas.
- **SQL Injection:** Queries parametrizadas (Panache/Hibernate JPQL).

### Integración
- **API Gateway:** El backend MongoDB (puerto 8080) orquesta todas las
  operaciones y delega a PostgreSQL vía REST Clients (MicroProfile).
- **UUID:** Identificador único compartido entre ambas bases de datos.
- **Flujo transaccional cross-DB:** Reserva en MongoDB → Crea orden en
  PostgreSQL → Confirma reserva en MongoDB.

---

## 5. Seguridad

| Aspecto | Implementación |
|---------|---------------|
| Autenticación | JWT (RS256, par de llaves pública/privada) |
| RBAC | 4 roles: SUPER_ADMIN, ADMIN_TIENDA, VENDEDOR, CLIENTE |
| Contraseñas | BCrypt 12 rounds |
| Tarjetas | Tokenización (no se almacenan PANs) |
| SQL Injection | Queries parametrizadas JPQL/HQL |
| CORS | Configurado para localhost:5173 y :8080 |
| Headers personalizados | X-Session-Id, X-Invitado para carrito invitado |

---

## 6. Stack Tecnológico

| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| Frontend | React + TypeScript + Vite | — |
| API Gateway | Quarkus (RESTEasy Reactive) | 3.36.2 |
| Backend SQL | Quarkus (Hibernate + Panache) | 3.36.2 |
| BD NoSQL | MongoDB | 8 |
| BD SQL | PostgreSQL | 16 |
| ORM | Hibernate ORM + Panache | — |
| Migraciones | Flyway | — |
| Autenticación | JWT + SmallRye | — |
| Validación | Jakarta Bean Validation | — |
| Documentación API | OpenAPI / Swagger UI | — |
| Contenedores | Docker + Docker Compose | — |
