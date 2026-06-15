-- Corrige hashes de seed anteriores que no correspondian a la contrasena documentada.
-- Contrasena para ambos usuarios de prueba: admin123
UPDATE usuarios
SET password_hash = '$2a$12$bRO69D7/Btwn3UqV8MPUs./KenEyk9wSNx2vrFGRxiP45B8KDunPi'
WHERE email IN ('admin@ecommerce.com', 'cliente@ecommerce.com');
