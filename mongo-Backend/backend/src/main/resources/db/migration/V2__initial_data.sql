-- Insertar roles
INSERT INTO roles (nombre, permisos) VALUES
('SUPER_ADMIN', '["*"]'),
('ADMIN_TIENDA', '["crear_producto", "editar_producto", "ver_reportes"]'),
('VENDEDOR', '["crear_producto", "editar_producto"]'),
('CLIENTE', '["comprar", "ver_historial"]');

-- Insertar un usuario de prueba (contraseña: admin123, hasheada con bcrypt 12 rounds)
INSERT INTO usuarios (id, email, password_hash, nombre, activo) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@ecommerce.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY8Kp4P.XPK', 'Super Admin', TRUE),
('22222222-2222-2222-2222-222222222222', 'cliente@ecommerce.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY8Kp4P.XPK', 'Cliente Prueba', TRUE);

-- Asignar roles a los usuarios
INSERT INTO usuario_roles (usuario_id, rol_id) VALUES
('11111111-1111-1111-1111-111111111111', 1), -- SUPER_ADMIN
('22222222-2222-2222-2222-222222222222', 4); -- CLIENTE
