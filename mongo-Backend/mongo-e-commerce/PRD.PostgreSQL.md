# 📦 Módulo PostgreSQL - E-Commerce Multitienda

## Guía para el compañero a cargo de PostgreSQL

Este documento explica **qué archivos crear** y **qué hacer en cada uno** para implementar la parte de PostgreSQL de nuestra arquitectura poliglota.

---

## 📌 Resumen Rápido

**Tu responsabilidad:**
- Gestionar **usuarios, roles, tiendas, pedidos, direcciones, facturas y pagos**
- Exponer **endpoints REST** para que MongoDB (mi servicio) consuma
- Ser el **SOURCE OF TRUTH** para todo lo relacionado con usuarios y transacciones

**No necesitas hacer:**
- Productos, carritos, inventario, promociones (eso va en MongoDB)

---

## 📂 Estructura de Archivos (Crea esto)
servicio-postgres/
├── src/
│ ├── controllers/
│ │ ├── auth.controller.js
│ │ ├── usuario.controller.js
│ │ ├── tienda.controller.js
│ │ ├── pedido.controller.js
│ │ └── direccion.controller.js
│ ├── services/
│ │ ├── auth.service.js
│ │ ├── usuario.service.js
│ │ ├── tienda.service.js
│ │ ├── pedido.service.js
│ │ └── direccion.service.js
│ ├── models/
│ │ ├── Usuario.js
│ │ ├── Rol.js
│ │ ├── Tienda.js
│ │ ├── Pedido.js
│ │ ├── DetallePedido.js
│ │ ├── Direccion.js
│ │ ├── MetodoPago.js
│ │ ├── Factura.js
│ │ └── Envio.js
│ ├── repositories/
│ │ ├── usuario.repository.js
│ │ ├── tienda.repository.js
│ │ └── pedido.repository.js
│ ├── routes/
│ │ ├── auth.routes.js
│ │ ├── usuario.routes.js
│ │ ├── tienda.routes.js
│ │ ├── pedido.routes.js
│ │ └── direccion.routes.js
│ ├── middlewares/
│ │ ├── auth.middleware.js
│ │ ├── validation.middleware.js
│ │ └── error.middleware.js
│ ├── utils/
│ │ ├── bcrypt.util.js
│ │ ├── jwt.util.js
│ │ └── uuid.util.js
│ ├── config/
│ │ ├── database.js
│ │ └── env.js
│ ├── migrations/
│ │ ├── 001_create_usuarios.sql
│ │ ├── 002_create_tiendas.sql
│ │ ├── 003_create_pedidos.sql
│ │ ├── 004_create_direcciones.sql
│ │ ├── 005_create_metodos_pago.sql
│ │ └── 006_create_facturas_envios.sql
│ ├── seeders/
│ │ └── initial_data.sql
│ └── app.js
├── .env
├── package.json
├── docker-compose.yml
└── README.md

---

## 📋 Archivo por Archivo - Qué Hacer

### 1. Configuración Inicial

#### `config/database.js`
Configurar la conexión a PostgreSQL usando las variables de entorno.

#### `config/env.js`
Cargar todas las variables de entorno desde el archivo `.env`.

#### `.env`
Definir estas variables:
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=ecommerce_db
JWT_SECRET=tu_secreto_aqui
PORT=8081

#### `package.json`
Declarar estas dependencias:
- express (servidor web)
- pg (conector PostgreSQL)
- bcrypt (hashear contraseñas)
- jsonwebtoken (generar JWT)
- dotenv (variables de entorno)
- cors (permitir peticiones desde otros servicios)

---

### 2. Modelos (Definen la estructura de las tablas)

Cada archivo representa una tabla en PostgreSQL.

| Archivo | Tabla | Campos principales |
|---------|-------|-------------------|
| `models/Usuario.js` | usuarios | id (UUID, PRIMARY KEY), email, password_hash, nombre, activo, tienda_id (FK), fecha_creacion |
| `models/Rol.js` | roles | id, nombre (SUPER_ADMIN, ADMIN_TIENDA, VENDEDOR, CLIENTE), permisos (JSONB) |
| `models/Tienda.js` | tiendas | id (UUID), nombre, descripcion, activo |
| `models/Pedido.js` | pedidos | id, usuario_id (FK), total, estado, fecha_creacion |
| `models/DetallePedido.js` | detalle_pedido | id, pedido_id (FK), producto_id (STRING - es ObjectId de MongoDB), cantidad, precio_unitario |
| `models/Direccion.js` | direcciones | id, usuario_id (FK), calle, ciudad, codigo_postal, pais |
| `models/MetodoPago.js` | metodos_pago | id, usuario_id (FK), token_tarjeta (cifrado), tipo, ultimos_digitos |
| `models/Factura.js` | facturas | id, pedido_id (FK), rfc, xml_url, pdf_url |
| `models/Envio.js` | envios | id, pedido_id (FK), tracking_number, estado, proveedor |

**Importante:** La tabla `detalle_pedido` guarda `producto_id` como STRING porque ese ID viene de MongoDB (es un ObjectId).

---

### 3. Repositorios (Consultas a la base de datos)

Cada repositorio contiene funciones que ejecutan SQL.

| Archivo | Funciones que debe tener |
|---------|-------------------------|
| `repositories/usuario.repository.js` | crear(), buscarPorEmail(), buscarPorId(), actualizar(), eliminar(), existe() |
| `repositories/tienda.repository.js` | crear(), buscarPorId(), listar(), actualizar(), eliminar(), existe() |
| `repositories/pedido.repository.js` | crear(), buscarPorId(), buscarPorUsuario(), actualizarEstado() |

---

### 4. Servicios (Lógica de negocio)

| Archivo | Qué debe hacer |
|---------|----------------|
| `services/auth.service.js` | Validar credenciales (comparar password con hash), generar JWT, verificar que usuario está activo |
| `services/usuario.service.js` | CRUD de usuarios, validar email único, hashear password antes de guardar |
| `services/tienda.service.js` | CRUD de tiendas, validar que no exista nombre duplicado |
| `services/pedido.service.js` | Crear pedido (validar que usuario existe), calcular total, actualizar estado, buscar pedidos por usuario |
| `services/direccion.service.js` | CRUD de direcciones, validar que pertenecen al usuario |

---

### 5. Controladores (Manejan las peticiones HTTP)

| Archivo | Endpoints que debe implementar |
|---------|-------------------------------|
| `controllers/auth.controller.js` | POST `/login` - recibe email y password, retorna JWT + datos usuario |
| `controllers/usuario.controller.js` | GET `/usuarios/:id`, POST `/usuarios`, PUT `/usuarios/:id`, DELETE `/usuarios/:id` |
| `controllers/tienda.controller.js` | GET `/tiendas/:id`, POST `/tiendas`, PUT `/tiendas/:id`, DELETE `/tiendas/:id` |
| `controllers/pedido.controller.js` | POST `/pedidos`, GET `/pedidos/usuario/:usuarioId`, PUT `/pedidos/:id/estado` |
| `controllers/direccion.controller.js` | GET `/direcciones/usuario/:usuarioId`, POST `/direcciones`, PUT `/direcciones/:id`, DELETE `/direcciones/:id` |

---

### 6. Rutas (Definen las URL de la API)

| Archivo | Endpoints que expone |
|---------|---------------------|
| `routes/auth.routes.js` | POST `/api/auth/login` |
| `routes/usuario.routes.js` | GET `/api/usuarios/validar`, GET `/api/usuarios/:id/existe`, GET `/api/usuarios/:id`, POST `/api/usuarios` |
| `routes/tienda.routes.js` | GET `/api/tiendas/:id`, GET `/api/tiendas/:id/existe`, POST `/api/tiendas` |
| `routes/pedido.routes.js` | POST `/api/pedidos`, GET `/api/pedidos/usuario/:usuarioId` |
| `routes/direccion.routes.js` | GET/POST/PUT/DELETE `/api/direcciones` |

---

### 7. Middlewares

| Archivo | Qué debe hacer |
|---------|----------------|
| `middlewares/auth.middleware.js` | Verificar JWT en peticiones protegidas, extraer usuario_id del token, validar roles |
| `middlewares/validation.middleware.js` | Validar email, campos requeridos, formato de datos |
| `middlewares/error.middleware.js` | Capturar errores y retornar respuestas consistentes (ej: { error: "mensaje" }) |

---

### 8. Migraciones SQL (Crear tablas en orden)

**Archivo `migrations/001_create_usuarios.sql`**
- CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
- CREATE TABLE roles (id SERIAL PRIMARY KEY, nombre VARCHAR(50), permisos JSONB)
- CREATE TABLE tiendas (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), nombre VARCHAR(100), activo BOOLEAN)
- CREATE TABLE usuarios (id UUID PRIMARY KEY, email VARCHAR(100) UNIQUE, password_hash TEXT, nombre VARCHAR(100), tienda_id UUID REFERENCES tiendas(id), activo BOOLEAN, fecha_creacion TIMESTAMP)
- CREATE TABLE usuario_roles (usuario_id UUID REFERENCES usuarios(id), rol_id INTEGER REFERENCES roles(id))

**Archivo `migrations/002_create_pedidos.sql`**
- CREATE TABLE pedidos (id UUID PRIMARY KEY, usuario_id UUID REFERENCES usuarios(id), total DECIMAL(10,2), estado VARCHAR(50), fecha_creacion TIMESTAMP)
- CREATE TABLE detalle_pedido (id SERIAL PRIMARY KEY, pedido_id UUID REFERENCES pedidos(id), producto_id VARCHAR(50), cantidad INTEGER, precio_unitario DECIMAL(10,2))

**Archivo `migrations/003_create_direcciones.sql`**
- CREATE TABLE direcciones (id UUID PRIMARY KEY, usuario_id UUID REFERENCES usuarios(id), calle TEXT, ciudad VARCHAR(100), codigo_postal VARCHAR(20), pais VARCHAR(50))

**Archivo `migrations/004_create_metodos_pago.sql`**
- CREATE TABLE metodos_pago (id UUID PRIMARY KEY, usuario_id UUID REFERENCES usuarios(id), token_tarjeta TEXT, tipo VARCHAR(50), ultimos_digitos VARCHAR(4))

**Archivo `migrations/005_create_facturas_envios.sql`**
- CREATE TABLE facturas (id UUID PRIMARY KEY, pedido_id UUID REFERENCES pedidos(id), rfc VARCHAR(20), xml_url TEXT, pdf_url TEXT)
- CREATE TABLE envios (id UUID PRIMARY KEY, pedido_id UUID REFERENCES pedidos(id), tracking_number VARCHAR(100), estado VARCHAR(50), proveedor VARCHAR(100))

---

### 9. Seeders (Datos iniciales)

**Archivo `seeders/initial_data.sql`**
- INSERT INTO roles (nombre, permisos) VALUES 
  ('SUPER_ADMIN', '["*"]'),
  ('ADMIN_TIENDA', '["crear_producto", "editar_producto", "ver_reportes"]'),
  ('VENDEDOR', '["crear_producto", "editar_producto"]'),
  ('CLIENTE', '["comprar", "ver_historial"]')
- INSERT INTO usuarios (id, email, password_hash, nombre, activo) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'admin@ecommerce.com', '[HASH_DE_ADMIN123]', 'Super Admin', true)
- INSERT INTO usuario_roles (usuario_id, rol_id) VALUES ('11111111-1111-1111-1111-111111111111', 1)

---

### 10. Archivo Principal

**`app.js`**
- Importar express
- Configurar CORS (permitir peticiones desde el servicio MongoDB)
- Configurar express.json() para parsear JSON
- Conectar a PostgreSQL
- Registrar todas las rutas
- Iniciar servidor en el puerto definido

---

## 🔌 Endpoints OBLIGATORIOS para MongoDB

Estos son los endpoints que **debes exponer sí o sí** porque mi servicio MongoDB los necesita:

| Endpoint | Método | Qué retorna | Para qué lo usa MongoDB |
|----------|--------|-------------|------------------------|
| `/api/auth/login` | POST | { token, usuario } | Login de usuarios |
| `/api/usuarios/validar?email=X&password=Y` | GET | Datos del usuario | Validar credenciales |
| `/api/usuarios/:id/existe` | GET | { existe: true/false } | Validar usuario antes de crear carrito |
| `/api/usuarios/:id` | GET | Datos completos del usuario | Obtener perfil |
| `/api/tiendas/:id/existe` | GET | { existe: true/false } | Validar tienda al crear producto |
| `/api/pedidos` | POST | { id, estado, total } | Crear pedido después de checkout |

---

## 📋 Formato de Respuestas Esperado

### Respuesta de `/api/auth/login` (POST)
```json
{
  "token": "jwt_token_aqui",
  "usuario": {
    "id": "uuid",
    "email": "usuario@email.com",
    "nombre": "Nombre Apellido",
    "rol": "CLIENTE",
    "tiendaId": null
  }
}
Respuesta de /api/usuarios/validar (GET)
json
{
  "id": "uuid",
  "email": "usuario@email.com",
  "nombre": "Nombre Apellido",
  "rol": "CLIENTE",
  "tiendaId": null,
  "activo": true
}
Respuesta de /api/usuarios/:id/existe (GET)
json
{
  "existe": true
}
Respuesta de /api/pedidos (POST - lo que envía MongoDB)
json
{
  "usuarioId": "uuid",
  "items": [
    {
      "productoId": "objectid_de_mongodb",
      "cantidad": 2,
      "precioUnitario": 100.00
    }
  ],
  "total": 200.00,
  "direccionId": "uuid"
}
Respuesta de /api/pedidos (POST - lo que retorna PostgreSQL)
json
{
  "id": "uuid_del_pedido",
  "estado": "PENDIENTE",
  "total": 200.00,
  "fechaCreacion": "2026-01-01T00:00:00Z"
}
🐳 Docker (Opcional pero recomendado)
docker-compose.yml
yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    container_name: postgres-ecommerce
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: admin123
      POSTGRES_DB: ecommerce_db
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./src/migrations:/docker-entrypoint-initdb.d
volumes:
  postgres-data:
Dockerfile (opcional, si quieres construir tu propia imagen)
Usar base node:20-alpine

Copiar package.json y hacer npm install

Copiar el resto del código

Exponer puerto 8081

Ejecutar node src/app.js

📋 Checklist de Finalización
Marca esto cuando lo tengas listo:

PostgreSQL instalado y corriendo en puerto 5432

Base de datos ecommerce_db creada

Todas las tablas creadas (ejecutaste las migraciones)

Datos iniciales cargados (roles y usuario admin)

Servidor Express corriendo en puerto 8081

Endpoint POST /api/auth/login funciona

Endpoint GET /api/usuarios/:id/existe funciona

Endpoint GET /api/tiendas/:id/existe funciona

Endpoint POST /api/pedidos funciona

CORS configurado (permitir peticiones desde http://localhost:8080)

Puedes hacer peticiones desde Postman a todos los endpoints

🔄 Pasos para Integrar conmigo (MongoDB)
Tú me dices: Tu IP y puerto (ej: http://localhost:8081)

Tú me das: El formato exacto de tus respuestas JSON

Yo configuro: La URL en mi application.properties

Probamos juntos: Login desde mi API → Tu API valida credenciales

📚 Tecnologías Sugeridas
Capa	Tecnología
Runtime	Node.js 20+
Framework	Express
Base de datos	PostgreSQL 16
ORM/Query Builder	Prisma o Knex.js
Autenticación	JWT + bcrypt
Validación	Joi o Zod
❌ Lo que NO debes hacer
No guardes productos en PostgreSQL (eso va en MongoDB)

No guardes carritos en PostgreSQL (eso va en MongoDB)

No guardes inventario en PostgreSQL (eso va en MongoDB)

No guardes promociones en PostgreSQL (eso va en MongoDB)