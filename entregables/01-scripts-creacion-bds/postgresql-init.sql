-- =============================================================================
-- Script de creación de base de datos PostgreSQL: ecommerce_db
-- =============================================================================
-- Compatible con PostgreSQL 16+
-- Ejecutado automáticamente por Flyway en el backend de Quarkus
-- (src/main/resources/db/migration/)
-- =============================================================================

-- Habilita extensión UUID (necesaria para @UuidGenerator en JPA)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLAS (3NF - Tercera Forma Normal)
-- =============================================================================

-- 1. Tiendas
CREATE TABLE tiendas (
    id UUID PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE UNIQUE INDEX uk_tienda_nombre ON tiendas (nombre);

-- 2. Roles (RBAC)
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    permisos JSONB
);
CREATE UNIQUE INDEX uk_rol_nombre ON roles (nombre);

-- 3. Usuarios (clientes)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,   -- BCrypt 12 rounds
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tienda_id UUID,
    CONSTRAINT fk_usuario_tienda FOREIGN KEY (tienda_id) REFERENCES tiendas(id)
);
CREATE UNIQUE INDEX uk_usuario_email ON usuarios (email);
CREATE INDEX idx_usuario_tienda_id ON usuarios (tienda_id);

-- 4. Usuario-Rol (relación M:N)
CREATE TABLE usuario_roles (
    usuario_id UUID NOT NULL,
    rol_id BIGINT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (usuario_id, rol_id),
    CONSTRAINT fk_usuario_rol_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_usuario_rol_rol FOREIGN KEY (rol_id) REFERENCES roles(id)
);
CREATE INDEX idx_usuario_rol_rol_id ON usuario_roles (rol_id);

-- 5. Pedidos (transacciones ACID)
CREATE TABLE pedidos (
    id UUID PRIMARY KEY,
    usuario_id UUID NOT NULL,
    total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    estado VARCHAR(50) NOT NULL,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pedido_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
CREATE INDEX idx_pedido_usuario_id ON pedidos (usuario_id);
CREATE INDEX idx_pedido_estado ON pedidos (estado);
CREATE INDEX idx_pedido_fecha_creacion ON pedidos (fecha_creacion);

-- 6. Detalle de Pedido (líneas de producto)
CREATE TABLE detalle_pedido (
    id BIGSERIAL PRIMARY KEY,
    pedido_id UUID NOT NULL,
    producto_id VARCHAR(50) NOT NULL,       -- Referencia a MongoDB ObjectId
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
    CONSTRAINT fk_detalle_pedido_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);
CREATE INDEX idx_detalle_pedido_pedido_id ON detalle_pedido (pedido_id);

-- 7. Direcciones de envío
CREATE TABLE direcciones (
    id UUID PRIMARY KEY,
    usuario_id UUID NOT NULL,
    calle TEXT NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(20) NOT NULL,
    pais VARCHAR(50) NOT NULL,
    CONSTRAINT fk_direccion_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
CREATE INDEX idx_direccion_usuario_id ON direcciones (usuario_id);

-- 8. Métodos de pago (tokenizados)
CREATE TABLE metodos_pago (
    id UUID PRIMARY KEY,
    usuario_id UUID NOT NULL,
    token_tarjeta TEXT NOT NULL,            -- Token de gateway de pago
    tipo VARCHAR(50) NOT NULL,              -- VISA, MASTERCARD, etc.
    ultimos_digitos VARCHAR(4) NOT NULL,    -- Solo últimos 4 dígitos
    CONSTRAINT fk_metodo_pago_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
CREATE INDEX idx_metodo_pago_usuario_id ON metodos_pago (usuario_id);

-- 9. Facturas
CREATE TABLE facturas (
    id UUID PRIMARY KEY,
    pedido_id UUID NOT NULL UNIQUE,
    rfc VARCHAR(20) NOT NULL,
    xml_url TEXT,
    pdf_url TEXT,
    CONSTRAINT fk_factura_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);
CREATE INDEX idx_factura_pedido_id ON facturas (pedido_id);

-- 10. Envíos
CREATE TABLE envios (
    id UUID PRIMARY KEY,
    pedido_id UUID NOT NULL UNIQUE,
    tracking_number VARCHAR(100) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    proveedor VARCHAR(100) NOT NULL,
    CONSTRAINT fk_envio_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);
CREATE INDEX idx_envio_pedido_id ON envios (pedido_id);
CREATE INDEX idx_envio_tracking_number ON envios (tracking_number);

-- =============================================================================
-- DATOS INICIALES
-- =============================================================================

-- Roles del sistema (RBAC)
INSERT INTO roles (nombre, permisos) VALUES
('SUPER_ADMIN',  '["*"]'),
('ADMIN_TIENDA', '["crear_producto", "editar_producto", "ver_reportes"]'),
('VENDEDOR',     '["crear_producto", "editar_producto"]'),
('CLIENTE',      '["comprar", "ver_historial"]');

-- Tienda por defecto
INSERT INTO tiendas (id, nombre, descripcion, activo)
VALUES ('00000000-0000-0000-0000-000000000001', 'Tienda Principal', 'Tienda por defecto del sistema', TRUE);

-- Usuarios de prueba (password: admin123, BCrypt 12 rounds)
INSERT INTO usuarios (id, email, password_hash, nombre, activo, tienda_id) VALUES
('11111111-1111-1111-1111-111111111111',
 'admin@ecommerce.com',
 '$2a$12$bRO69D7/Btwn3UqV8MPUs./KenEyk9wSNx2vrFGRxiP45B8KDunPi',
 'Super Admin',
 TRUE,
 '00000000-0000-0000-0000-000000000001'),

('22222222-2222-2222-2222-222222222222',
 'cliente@ecommerce.com',
 '$2a$12$bRO69D7/Btwn3UqV8MPUs./KenEyk9wSNx2vrFGRxiP45B8KDunPi',
 'Cliente Prueba',
 TRUE,
 NULL);

-- Asignación de roles
INSERT INTO usuario_roles (usuario_id, rol_id) VALUES
('11111111-1111-1111-1111-111111111111', 1),  -- admin → SUPER_ADMIN
('22222222-2222-2222-2222-222222222222', 4);  -- cliente → CLIENTE
