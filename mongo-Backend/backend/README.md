# Postgres Backend — Documentación API

Backend relacional del e-commerce multitienda. Persiste en **PostgreSQL** los datos transaccionales y de identidad: usuarios, roles, tiendas, pedidos, direcciones, métodos de pago, facturas y envíos.

En la arquitectura políglota, este servicio es consumido principalmente por **mongo-e-commerce** (`:8080`) vía REST Client para autenticación y gestión de usuarios. El frontend (`:5173`) habla con mongo-e-commerce, no directamente con este backend en el flujo normal.

---

## Información general

| Propiedad | Valor |
|-----------|-------|
| **Framework** | Quarkus 3.36.2 |
| **Puerto por defecto** | `8082` |
| **Base URL local** | `http://localhost:8082` |
| **Formato** | `application/json` (camelCase) |
| **Base de datos** | PostgreSQL 16 — `ecommerce_db` |
| **Puerto PostgreSQL** | `5433` (host) → `5432` (contenedor) |
| **Migraciones** | Flyway (`src/main/resources/db/migration/`) |
| **OpenAPI** | `http://localhost:8082/q/openapi` |
| **Swagger UI** | `http://localhost:8082/q/swagger-ui` |

---

## Cómo ejecutar

### Base de datos (Docker)

```bash
cd mongo-Backend/backend
docker compose up -d
```

### Aplicación (desarrollo)

```bash
cd mongo-Backend/backend
mvn quarkus:dev
```

### Variables de entorno (opcionales)

| Variable | Default | Descripción |
|----------|---------|-------------|
| `QUARKUS_HTTP_PORT` | `8082` | Puerto HTTP |
| `DB_HOST` | `localhost` | Host PostgreSQL |
| `DB_PORT` | `5433` | Puerto PostgreSQL |
| `DB_NAME` | `ecommerce_db` | Nombre de la BD |
| `DB_USER` | `postgres` | Usuario |
| `DB_PASSWORD` | `admin123` | Contraseña |

---

## Usuarios de prueba (seed)

| Email | Contraseña | Rol |
|-------|------------|-----|
| `admin@ecommerce.com` | `admin123` | `SUPER_ADMIN` |
| `cliente@ecommerce.com` | `admin123` | `CLIENTE` |

---

## Roles del sistema

| ID | Nombre | Permisos |
|----|--------|----------|
| 1 | `SUPER_ADMIN` | `["*"]` |
| 2 | `ADMIN_TIENDA` | `["crear_producto", "editar_producto", "ver_reportes"]` |
| 3 | `VENDEDOR` | `["crear_producto", "editar_producto"]` |
| 4 | `CLIENTE` | `["comprar", "ver_historial"]` |

---

## Respuestas de error

### Errores de negocio / no encontrado

```json
{
  "message": "Descripción del error"
}
```

| Código HTTP | Cuándo |
|-------------|--------|
| `400` | Validación de negocio (`BusinessException`) o datos inválidos |
| `404` | Recurso no encontrado (`ResourceNotFoundException`) |
| `500` | Error interno no controlado |

### Errores de validación Bean Validation (POST/PUT)

Cuando faltan campos obligatorios o el formato es incorrecto:

```json
{
  "title": "Constraint Violation",
  "status": 400,
  "violations": [
    {
      "field": "create.arg0.passwordHash",
      "message": "no debe estar vacío"
    }
  ]
}
```

---

## Esquemas de datos (DTOs)

### UsuarioRequest — body de creación/actualización

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `email` | `string` | Sí | Email válido, máx. 100 caracteres |
| `passwordHash` | `string` | Sí | Contraseña en texto plano; el servicio la hashea con BCrypt al crear |
| `nombre` | `string` | Sí | Nombre del usuario, máx. 100 caracteres |
| `activo` | `boolean` | Sí | Default: `true` |
| `tiendaId` | `UUID` | No | UUID de la tienda asociada |

**Ejemplo:**

```json
{
  "email": "nuevo@ejemplo.com",
  "passwordHash": "miPassword123",
  "nombre": "Usuario Nuevo",
  "activo": true,
  "tiendaId": null
}
```

> Al crear un usuario sin roles previos, se asigna automáticamente el rol **CLIENTE**.

### UsuarioResponse

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `UUID` | Identificador único |
| `email` | `string` | Email |
| `nombre` | `string` | Nombre |
| `activo` | `boolean` | Si el usuario está activo |
| `fechaCreacion` | `string` (ISO-8601) | Fecha de creación UTC |
| `tiendaId` | `UUID \| null` | Tienda asociada |
| `rol` | `string` | Rol activo principal (`SUPER_ADMIN`, `ADMIN_TIENDA`, `VENDEDOR`, `CLIENTE`) |
| `permisos` | `string[]` | Lista de permisos del rol |

**Ejemplo:**

```json
{
  "id": "11111111-1111-1111-1111-111111111111",
  "email": "admin@ecommerce.com",
  "nombre": "Super Admin",
  "activo": true,
  "fechaCreacion": "2026-06-14T23:26:23.040056Z",
  "tiendaId": null,
  "rol": "SUPER_ADMIN",
  "permisos": ["*"]
}
```

---

### TiendaRequest / TiendaResponse

**Request:**

| Campo | Tipo | Requerido |
|-------|------|-----------|
| `nombre` | `string` | Sí (máx. 100) |
| `descripcion` | `string` | No (máx. 500) |
| `activo` | `boolean` | Sí |

**Response:** `id` (`UUID`), `nombre`, `descripcion`, `activo`

---

### RolRequest / RolResponse

**Request:**

| Campo | Tipo | Requerido |
|-------|------|-----------|
| `nombre` | `string` | Sí (máx. 50) |
| `permisos` | `string` | No — JSON en texto, ej. `'["comprar"]'` |

**Response:** `id` (`number`), `nombre`, `permisos` (`string` JSON)

---

### PedidoRequest / PedidoResponse

**Request:**

| Campo | Tipo | Requerido |
|-------|------|-----------|
| `usuarioId` | `UUID` | Sí |
| `total` | `number` (decimal) | Sí, ≥ 0 |
| `estado` | `string` | Sí |

**Response:** `id` (`UUID`), `usuarioId`, `total`, `estado`, `fechaCreacion` (ISO-8601)

---

### DireccionRequest / DireccionResponse

**Request:**

| Campo | Tipo | Requerido |
|-------|------|-----------|
| `usuarioId` | `UUID` | Sí |
| `calle` | `string` | Sí |
| `ciudad` | `string` | Sí (máx. 100) |
| `codigoPostal` | `string` | Sí (máx. 20) |
| `pais` | `string` | Sí (máx. 50) |

**Response:** `id`, `usuarioId`, `calle`, `ciudad`, `codigoPostal`, `pais`

---

### MetodoPagoRequest / MetodoPagoResponse

**Request:**

| Campo | Tipo | Requerido |
|-------|------|-----------|
| `usuarioId` | `UUID` | Sí |
| `tokenTarjeta` | `string` | Sí — token seguro de la pasarela |
| `tipo` | `string` | Sí (máx. 50), ej. `VISA`, `MASTERCARD` |
| `ultimosDigitos` | `string` | Sí (4 caracteres) |

**Response:** `id`, `usuarioId`, `tokenTarjeta`, `tipo`, `ultimosDigitos`

---

### FacturaRequest / FacturaResponse

**Request:**

| Campo | Tipo | Requerido |
|-------|------|-----------|
| `pedidoId` | `UUID` | Sí |
| `rfc` | `string` | Sí (máx. 20) |
| `xmlUrl` | `string` | No |
| `pdfUrl` | `string` | No |

**Response:** `id`, `pedidoId`, `rfc`, `xmlUrl`, `pdfUrl`

---

### EnvioRequest / EnvioResponse

**Request:**

| Campo | Tipo | Requerido |
|-------|------|-----------|
| `pedidoId` | `UUID` | Sí |
| `trackingNumber` | `string` | Sí (máx. 100) |
| `estado` | `string` | Sí (máx. 50) |
| `proveedor` | `string` | Sí (máx. 100) |

**Response:** `id`, `pedidoId`, `trackingNumber`, `estado`, `proveedor`

---

## API — Endpoints

Convenciones:

- **Body** solo en `POST` y `PUT` (JSON).
- **DELETE** exitoso → `204 No Content` sin body.
- **POST** exitoso → `201 Created` con el recurso creado.
- Listados → `200 OK` con array JSON.

---

### Usuarios — `/usuarios`

| Método | Ruta | Body request | Respuesta | Códigos |
|--------|------|--------------|-----------|---------|
| `GET` | `/usuarios/validar?email={email}&password={password}` | — | `UsuarioResponse` | `200`, `400` |
| `GET` | `/usuarios` | — | `UsuarioResponse[]` | `200` |
| `GET` | `/usuarios/me` | — | `UsuarioResponse` | `200`, `401`, `404` |
| `GET` | `/usuarios/{id}` | — | `UsuarioResponse` | `200`, `404` |
| `GET` | `/usuarios/email/{email}` | — | `UsuarioResponse` | `200`, `404` |
| `POST` | `/usuarios` | `UsuarioRequest` | `UsuarioResponse` | `201`, `400` |
| `PUT` | `/usuarios/{id}` | `UsuarioRequest` | `UsuarioResponse` | `200`, `400`, `404` |
| `DELETE` | `/usuarios/{id}` | — | — | `204`, `404` |

**`GET /usuarios/validar`** — Usado por mongo-e-commerce para autenticación. Valida email y contraseña (BCrypt). Retorna los datos del usuario para generar el JWT.

```bash
curl "http://localhost:8082/usuarios/validar?email=admin@ecommerce.com&password=admin123"
```

**`GET /usuarios/me`** — Requiere JWT en el header (emitido por mongo-e-commerce tras login).

```bash
curl http://localhost:8082/usuarios/me \
  -H "Authorization: Bearer <tu_jwt_aqui>"
```

**`POST /usuarios`** — Crea usuario y asigna rol CLIENTE por defecto.

```bash
curl -X POST http://localhost:8082/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@ejemplo.com",
    "passwordHash": "miPassword123",
    "nombre": "Usuario Nuevo",
    "activo": true
  }'
```

---

### Tiendas — `/tiendas`

| Método | Ruta | Body request | Respuesta | Códigos |
|--------|------|--------------|-----------|---------|
| `GET` | `/tiendas` | — | `TiendaResponse[]` | `200` |
| `GET` | `/tiendas/{id}` | — | `TiendaResponse` | `200`, `404` |
| `POST` | `/tiendas` | `TiendaRequest` | `TiendaResponse` | `201`, `400` |
| `PUT` | `/tiendas/{id}` | `TiendaRequest` | `TiendaResponse` | `200`, `400`, `404` |
| `DELETE` | `/tiendas/{id}` | — | — | `204`, `404` |

**Ejemplo POST:**

```json
{
  "nombre": "Tienda Demo",
  "descripcion": "Tienda de prueba",
  "activo": true
}
```

---

### Roles — `/roles`

| Método | Ruta | Body request | Respuesta | Códigos |
|--------|------|--------------|-----------|---------|
| `GET` | `/roles` | — | `RolResponse[]` | `200` |
| `GET` | `/roles/{id}` | — | `RolResponse` | `200`, `404` |
| `POST` | `/roles` | `RolRequest` | `RolResponse` | `201`, `400` |
| `PUT` | `/roles/{id}` | `RolRequest` | `RolResponse` | `200`, `400`, `404` |
| `DELETE` | `/roles/{id}` | — | — | `204`, `404` |

> `{id}` es de tipo `number` (BIGSERIAL), no UUID.

**Ejemplo POST:**

```json
{
  "nombre": "MODERADOR",
  "permisos": "[\"ver_reportes\"]"
}
```

---

### Pedidos — `/pedidos`

| Método | Ruta | Body request | Respuesta | Códigos |
|--------|------|--------------|-----------|---------|
| `GET` | `/pedidos` | — | `PedidoResponse[]` | `200` |
| `GET` | `/pedidos/{id}` | — | `PedidoResponse` | `200`, `404` |
| `GET` | `/pedidos/usuario/{usuarioId}` | — | `PedidoResponse[]` | `200` |
| `POST` | `/pedidos` | `PedidoRequest` | `PedidoResponse` | `201`, `400` |
| `PUT` | `/pedidos/{id}` | `PedidoRequest` | `PedidoResponse` | `200`, `400`, `404` |
| `DELETE` | `/pedidos/{id}` | — | — | `204`, `404` |

**Ejemplo POST:**

```json
{
  "usuarioId": "22222222-2222-2222-2222-222222222222",
  "total": 149.99,
  "estado": "PENDIENTE"
}
```

---

### Direcciones — `/direcciones`

| Método | Ruta | Body request | Respuesta | Códigos |
|--------|------|--------------|-----------|---------|
| `GET` | `/direcciones` | — | `DireccionResponse[]` | `200` |
| `GET` | `/direcciones/{id}` | — | `DireccionResponse` | `200`, `404` |
| `GET` | `/direcciones/usuario/{usuarioId}` | — | `DireccionResponse[]` | `200` |
| `POST` | `/direcciones` | `DireccionRequest` | `DireccionResponse` | `201`, `400` |
| `PUT` | `/direcciones/{id}` | `DireccionRequest` | `DireccionResponse` | `200`, `400`, `404` |
| `DELETE` | `/direcciones/{id}` | — | — | `204`, `404` |

**Ejemplo POST:**

```json
{
  "usuarioId": "22222222-2222-2222-2222-222222222222",
  "calle": "Av. Principal 123",
  "ciudad": "La Paz",
  "codigoPostal": "0000",
  "pais": "Bolivia"
}
```

---

### Métodos de pago — `/metodos-pago`

| Método | Ruta | Body request | Respuesta | Códigos |
|--------|------|--------------|-----------|---------|
| `GET` | `/metodos-pago` | — | `MetodoPagoResponse[]` | `200` |
| `GET` | `/metodos-pago/{id}` | — | `MetodoPagoResponse` | `200`, `404` |
| `GET` | `/metodos-pago/usuario/{usuarioId}` | — | `MetodoPagoResponse[]` | `200` |
| `POST` | `/metodos-pago` | `MetodoPagoRequest` | `MetodoPagoResponse` | `201`, `400` |
| `PUT` | `/metodos-pago/{id}` | `MetodoPagoRequest` | `MetodoPagoResponse` | `200`, `400`, `404` |
| `DELETE` | `/metodos-pago/{id}` | — | — | `204`, `404` |

**Ejemplo POST:**

```json
{
  "usuarioId": "22222222-2222-2222-2222-222222222222",
  "tokenTarjeta": "tok_visa_4242",
  "tipo": "VISA",
  "ultimosDigitos": "4242"
}
```

---

### Facturas — `/facturas`

| Método | Ruta | Body request | Respuesta | Códigos |
|--------|------|--------------|-----------|---------|
| `GET` | `/facturas` | — | `FacturaResponse[]` | `200` |
| `GET` | `/facturas/{id}` | — | `FacturaResponse` | `200`, `404` |
| `GET` | `/facturas/pedido/{pedidoId}` | — | `FacturaResponse[]` | `200` |
| `POST` | `/facturas` | `FacturaRequest` | `FacturaResponse` | `201`, `400` |
| `PUT` | `/facturas/{id}` | `FacturaRequest` | `FacturaResponse` | `200`, `400`, `404` |
| `DELETE` | `/facturas/{id}` | — | — | `204`, `404` |

> Relación 1:1 con pedido (`pedido_id` UNIQUE).

**Ejemplo POST:**

```json
{
  "pedidoId": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "rfc": "XAXX010101000",
  "xmlUrl": "https://storage.example.com/factura.xml",
  "pdfUrl": "https://storage.example.com/factura.pdf"
}
```

---

### Envíos — `/envios`

| Método | Ruta | Body request | Respuesta | Códigos |
|--------|------|--------------|-----------|---------|
| `GET` | `/envios` | — | `EnvioResponse[]` | `200` |
| `GET` | `/envios/{id}` | — | `EnvioResponse` | `200`, `404` |
| `GET` | `/envios/pedido/{pedidoId}` | — | `EnvioResponse[]` | `200` |
| `POST` | `/envios` | `EnvioRequest` | `EnvioResponse` | `201`, `400` |
| `PUT` | `/envios/{id}` | `EnvioRequest` | `EnvioResponse` | `200`, `400`, `404` |
| `DELETE` | `/envios/{id}` | — | — | `204`, `404` |

> Relación 1:1 con pedido (`pedido_id` UNIQUE).

**Ejemplo POST:**

```json
{
  "pedidoId": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "trackingNumber": "TRK-2026-00001",
  "estado": "EN_TRANSITO",
  "proveedor": "DHL"
}
```

---

## Modelo de base de datos (resumen)

```
tiendas ──┐
          ├── usuarios ──┬── usuario_roles ── roles
          │              ├── pedidos ──┬── facturas
          │              │             └── envios
          │              ├── direcciones
          │              └── metodos_pago
          └── (tienda_id en usuarios)

pedidos ── detalle_pedido (producto_id referencia catálogo Mongo)
```

| Tabla | PK | Notas |
|-------|-----|-------|
| `tiendas` | `UUID` | Nombre único |
| `roles` | `BIGSERIAL` | Permisos en JSONB |
| `usuarios` | `UUID` | Email único, password BCrypt |
| `usuario_roles` | compuesta | Usuario ↔ Rol |
| `pedidos` | `UUID` | FK → usuarios |
| `detalle_pedido` | `BIGSERIAL` | `producto_id` es string (Mongo) |
| `direcciones` | `UUID` | FK → usuarios |
| `metodos_pago` | `UUID` | FK → usuarios |
| `facturas` | `UUID` | FK → pedidos (1:1) |
| `envios` | `UUID` | FK → pedidos (1:1) |

---

## Integración con mongo-e-commerce

El cliente REST en mongo-e-commerce consume estos endpoints internos:

| Operación mongo | Endpoint postgres |
|-----------------|-------------------|
| Login (validar credenciales) | `GET /usuarios/validar` |
| Register (crear usuario) | `POST /usuarios` |
| Obtener usuario por ID | `GET /usuarios/{id}` |

Configuración en mongo-e-commerce:

```properties
quarkus.rest-client.postgresql-api.url=http://localhost:8082
```

En Docker:

```yaml
QUARKUS_REST_CLIENT_POSTGRESQL_API_URL: http://host.docker.internal:8082
```

---

## CORS

Orígenes permitidos: `http://localhost:8080`, `http://localhost:5173`

```properties
quarkus.http.cors.enabled=true
quarkus.http.cors.origins=http://localhost:8080,http://localhost:5173
```

---

## Notas adicionales

- **Seguridad:** Este backend no expone endpoints de login/register al frontend directamente; la autenticación JWT la gestiona mongo-e-commerce.
- **`GET /usuarios/me`:** Requiere header `Authorization: Bearer <JWT>`. El `sub` del token debe coincidir con el UUID del usuario en PostgreSQL. El JWT lo emite mongo-e-commerce.
- **Contraseñas:** En `POST /usuarios`, `passwordHash` se recibe en texto plano y se hashea con BCrypt (12 rounds) antes de guardar.
- **Detalle de pedido:** La tabla `detalle_pedido` existe en el esquema pero aún no tiene endpoints REST expuestos.
