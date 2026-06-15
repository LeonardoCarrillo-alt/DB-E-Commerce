-- Crear tienda por defecto si no existe
INSERT INTO tiendas (id, nombre, descripcion, activo)
SELECT '00000000-0000-0000-0000-000000000001', 'Tienda Principal', 'Tienda por defecto del sistema', TRUE
WHERE NOT EXISTS (SELECT 1 FROM tiendas WHERE id = '00000000-0000-0000-0000-000000000001');

-- Asignar tienda al SUPER_ADMIN si no tiene una
UPDATE usuarios
SET tienda_id = '00000000-0000-0000-0000-000000000001'
WHERE email = 'admin@ecommerce.com' AND tienda_id IS NULL;
