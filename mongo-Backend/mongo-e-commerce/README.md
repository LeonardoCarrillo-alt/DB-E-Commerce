# Backend MongoDB — DBE-Commerce

**Tecnologías:** Quarkus 3.36.2 · Panache MongoDB · MicroProfile JWT · Jakarta REST  
**Base de datos:** MongoDB  
**Puerto:** Microservicio independiente dentro del ecosistema DBE-Commerce

---

## ¿Qué hace este microservicio?

Este backend maneja todo lo relacionado con el **catálogo de productos, carrito de compras, inventario, promociones y búsqueda** de la plataforma de e-commerce. Se comunica con el backend PostgreSQL (que gestiona usuarios y tiendas) a través de un cliente REST, y emite sus propios tokens JWT para autenticar requests.

---

## Colecciones MongoDB

| Colección | Entidad | Descripción |
|-----------|---------|-------------|
| `productos` | `Producto` | Catálogo de productos con atributos dinámicos por categoría |
| `carritos` | `Carrito` | Carrito de compras de usuarios registrados e invitados |
| `inventario` | `Inventario` | Stock por producto/variante con historial de movimientos |
| `promociones` | `Promocion` | Códigos y reglas de descuento |
| `resenas` | `Resena` | Reseñas y calificaciones de productos |
| `historial_busquedas` | `HistorialBusqueda` | Registro de búsquedas por usuario |

---

## Módulos

### 1. Productos (`/productos`)
Gestión del catálogo de productos de todas las tiendas.

- Listar, buscar por ID, crear, actualizar y eliminar productos
- Búsqueda dinámica con filtros por categoría, tienda, rango de precio y **atributos dinámicos BSON** (ej: talla, color, material — varía por categoría)
- Solo `ADMIN_TIENDA` y `SUPER_ADMIN` pueden crear, editar o eliminar

El campo `atributos` es un `Map<String, Object>` en BSON, lo que permite que cada categoría tenga sus propios campos sin esquema fijo (ropa tiene talla y color, electrónica tiene voltaje y garantía, etc.).

---

### 2. Búsqueda (`/busqueda`)
Motor de búsqueda avanzada de productos.

- Búsqueda full-text con índices de MongoDB
- Filtros combinables: texto, categoría, tienda, rango de precio, atributos dinámicos, fechas
- Paginación con metadatos (total, páginas, tiempo de respuesta)
- **Autocompletado** en tiempo real (mínimo 2 caracteres)
- **Facets** — conteo de resultados por categoría para los filtros laterales
- Productos **destacados** y **relacionados** (por categoría y atributos similares)
- Guarda historial de búsquedas por usuario para sugerencias futuras
- Endpoint accesible sin autenticación (`@PermitAll`)

---

### 3. Carrito (`/carrito`)
Gestión completa del carrito de compras.

- Soporta tanto **usuarios registrados** como **invitados** (identificados por sessionId)
- Agregar, actualizar cantidad y eliminar ítems
- Validación de stock disponible en tiempo real antes de agregar
- Aplicar y quitar códigos de promoción con cálculo de descuento automático
- Limpiar carrito completo
- **Migración de carrito invitado** → usuario registrado al hacer login: fusiona ítems si ya tenía carrito
- Resumen de checkout con validación de stock de todos los ítems

---

### 4. Inventario (`/inventario`)
Control de stock por producto y variante.

- Consulta de stock disponible y total
- **Reserva de stock** al iniciar checkout (bloquea unidades temporalmente)
- **Confirmación de compra** — convierte reservas en ventas definitivas
- **Cancelación de reserva** — libera stock si el checkout falla o el usuario cancela
- Reabastecimiento manual de stock
- Alertas de stock bajo (niveles: NORMAL, BAJO, CRÍTICO) por tienda
- Historial completo de movimientos por ítem (RESERVA, CONFIRMACION, CANCELACION, REABASTECIMIENTO)
- **Job automático** cada 5 minutos que libera reservas expiradas (más de 15 minutos sin confirmar)

---

### 5. Promociones (`/promociones`)
Motor de descuentos y códigos promocionales.

Tipos de promoción soportados:
- `PORCENTAJE` — descuento porcentual sobre el subtotal
- `MONTO_FIJO` — descuento de monto fijo
- `ENVIO_GRATIS` — elimina costo de envío
- `2X1` — lleva dos paga uno
- `COMPRA_LLEVA` — compra X lleva Y con descuento

Condiciones configurables:
- Monto mínimo de compra
- Cantidad mínima de ítems
- Categorías, tiendas o productos específicos
- Límite de usos totales y por usuario
- Solo para primera compra
- Segmentación por rol de usuario (VIP, NUEVO, REGULAR)
- Fechas de vigencia
- Promociones apilables o excluyentes entre sí

---

### 6. Autenticación (`/auth`)
El microservicio **no gestiona usuarios propios** — los delega al backend PostgreSQL.

Flujo:
1. El cliente envía credenciales a este backend
2. Este backend llama al **PostgreSQLClient** (REST client) para validar email/password
3. Si son válidas, genera y retorna un **JWT** firmado con SmallRye JWT
4. El JWT incluye: `subject` (userId), `email`, `nombre`, `rol`, `groups` (roles heredados), `tiendaId` (si aplica)
5. Se emite también un **refresh token** con vigencia de 24 horas

Jerarquía de roles (heredados automáticamente):
```
SUPER_ADMIN → ADMIN_TIENDA → VENDEDOR → CLIENTE
```

---

## Integración con PostgreSQL

A través de `PostgreSQLClient` (MicroProfile REST Client), este backend consume:

| Endpoint PostgreSQL | Uso |
|--------------------|-----|
| `GET /api/usuarios/validar` | Validar credenciales en login |
| `GET /api/usuarios/{id}` | Obtener datos del usuario por ID |
| `GET /api/usuarios/me` | Obtener usuario actual por token |

El `tiendaId` que llega desde PostgreSQL se usa en MongoDB para asociar productos, inventario y promociones a tiendas específicas.

---

## Job Programado

| Job | Frecuencia | Función |
|-----|-----------|---------|
| `ReservaExpirationJob` | Cada 5 minutos | Libera stock reservado por checkouts que no se completaron en 15 minutos |

---

## Seguridad

- Autenticación via **MicroProfile JWT** (`quarkus-smallrye-jwt`)
- Endpoints protegidos con `@RolesAllowed`
- Validación de acceso por `tiendaId` — un admin de tienda solo puede modificar sus propios productos
- Bean Validation con `@Valid` en los DTOs de entrada (`quarkus-hibernate-validator`)

---

## Endpoints REST

### Auth — `/auth`
| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| `POST` | `/auth/login` | Público | Valida credenciales contra PostgreSQL y retorna JWT + refresh token |
| `POST` | `/auth/refresh` | Público | Renueva el access token usando un refresh token válido |
| `POST` | `/auth/logout` | Público | Invalida la sesión actual |
| `GET` | `/auth/me` | Público | Retorna los datos del usuario autenticado desde el JWT |

---

### Productos — `/productos`
| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| `GET` | `/productos` | Público | Lista todos los productos activos |
| `GET` | `/productos/{id}` | Público | Obtiene un producto por su ID |
| `POST` | `/productos` | ADMIN_TIENDA, SUPER_ADMIN | Crea un nuevo producto con validación de acceso por tienda |
| `PUT` | `/productos/{id}` | ADMIN_TIENDA, SUPER_ADMIN, VENDEDOR | Actualiza los datos de un producto existente |
| `DELETE` | `/productos/{id}` | ADMIN_TIENDA, SUPER_ADMIN | Elimina un producto validando que pertenezca a la tienda del admin |
| `POST` | `/productos/buscar` | Público | Búsqueda simple con filtros dinámicos por categoría, tienda, precio y atributos |

---

### Búsqueda — `/busqueda`
| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| `POST` | `/busqueda/productos` | Público | Búsqueda avanzada con filtros, paginación, facets y metadatos |
| `GET` | `/busqueda/productos` | Público | Búsqueda simple vía query params (`q`, `categoria`, `precio_min`, `precio_max`, `pagina`, `limite`, `ordenar`, `dir`) |
| `GET` | `/busqueda/autocompletar?q=` | Público | Sugerencias de autocompletado en tiempo real (mínimo 2 caracteres) |
| `GET` | `/busqueda/destacados` | Público | Productos destacados o más populares, filtrable por categoría |
| `GET` | `/busqueda/relacionados/{productoId}` | Público | Productos relacionados al dado, por categoría y atributos similares |

---

### Carrito — `/carrito`
> Los headers `X-Session-Id` y `X-Invitado: true` identifican carritos de usuarios invitados.

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| `GET` | `/carrito` | Autenticado / Invitado | Obtiene el carrito activo del usuario o lo crea si no existe |
| `POST` | `/carrito/items` | Autenticado / Invitado | Agrega un producto al carrito validando stock disponible |
| `PUT` | `/carrito/items` | Autenticado / Invitado | Actualiza la cantidad de un ítem; si cantidad ≤ 0 lo elimina |
| `DELETE` | `/carrito/items/{productoId}` | Autenticado / Invitado | Elimina un producto específico del carrito |
| `DELETE` | `/carrito` | Autenticado / Invitado | Vacía completamente el carrito |
| `POST` | `/carrito/promocion` | Autenticado / Invitado | Aplica un código de promoción y recalcula totales |
| `DELETE` | `/carrito/promocion` | Autenticado / Invitado | Quita el código de promoción aplicado |
| `GET` | `/carrito/checkout/resumen` | Autenticado / Invitado | Retorna resumen del carrito validando stock de todos los ítems |
| `POST` | `/carrito/checkout/procesar` | Autenticado / Invitado | Procesa el checkout y reserva el stock |
| `POST` | `/carrito/migrar?sessionId=` | CLIENTE, ADMIN_TIENDA, SUPER_ADMIN | Migra el carrito de invitado al usuario registrado tras el login |

---

### Inventario — `/inventario`
| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| `GET` | `/inventario/stock/{productoId}` | Público | Consulta el stock disponible de un producto, opcionalmente por variante |
| `POST` | `/inventario/reservar` | CLIENTE, ADMIN_TIENDA, SUPER_ADMIN | Reserva stock al iniciar checkout (expira en 15 minutos) |
| `POST` | `/inventario/confirmar` | CLIENTE, ADMIN_TIENDA, SUPER_ADMIN | Confirma la compra y convierte la reserva en venta definitiva |
| `DELETE` | `/inventario/reservar/{reservaId}` | Autenticado | Cancela una reserva y libera el stock |
| `POST` | `/inventario/reabastecer` | ADMIN_TIENDA, SUPER_ADMIN | Agrega unidades al stock de un producto |
| `GET` | `/inventario/alertas/{tiendaId}` | ADMIN_TIENDA, SUPER_ADMIN | Lista productos con stock bajo o crítico de una tienda |
| `POST` | `/inventario/limpiar-expiradas` | SUPER_ADMIN | Libera manualmente reservas expiradas (también se ejecuta automáticamente) |

---

### Promociones — `/promociones`
| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| `GET` | `/promociones/vigentes` | Público | Lista todas las promociones activas y dentro de su fecha de vigencia |
| `POST` | `/promociones/aplicar` | Público | Valida y aplica un código de cupón calculando el descuento correspondiente |
| `POST` | `/promociones` | ADMIN_TIENDA, SUPER_ADMIN | Crea una nueva promoción con sus reglas y condiciones |
| `DELETE` | `/promociones/{id}` | ADMIN_TIENDA, SUPER_ADMIN | Elimina una promoción existente |

---

## Estructura de Paquetes

```
bo.com.proj
├── client/       # REST client hacia PostgreSQL
├── dto/          # Objetos de transferencia de datos
├── entity/       # Entidades MongoDB (Panache)
├── exception/    # NotFoundException, ValidationException
├── job/          # Jobs programados (Quarkus Scheduler)
├── model/        # Modelos internos (Usuario de PostgreSQL)
├── repository/   # Capa de acceso a datos
├── resource/     # Endpoints REST (controllers)
├── security/     # Generación de JWT
└── service/      # Lógica de negocio
```
