# Scripts de Creación de Bases de Datos

## MongoDB: `mongodb-init.js`

Crea la base de datos `ecommerce_multitienda` con 6 colecciones:
- `productos` — Catálogo con esquema dinámico BSON y validación `$jsonSchema`
- `carritos` — Carritos de compra (autenticados e invitados)
- `resenas` — Reseñas y calificaciones de productos
- `historial_busquedas` — Historial de términos buscados
- `inventario` — Stock, reservas y movimientos
- `promociones` — Códigos de descuento y reglas

Incluye 23 índices: texto compuesto, compuestos por categoría+precio,
tienda+activo, atributos dinámicos (marca, talla, color), y únicos para
carritos por usuario y producto+variante en inventario.

### Ejecución
```bash
mongosh < mongodb-init.js
```
O automáticamente vía Docker Compose montando el script en
`/docker-entrypoint-initdb.d/`.

---

## PostgreSQL: `postgresql-init.sql`

Crea la base de datos `ecommerce_db` con 10 tablas normalizadas (3FN):

| Tabla | Propósito |
|-------|-----------|
| `tiendas` | Catálogo de tiendas (multitienda) |
| `roles` | Roles RBAC con permisos en JSONB |
| `usuarios` | Clientes con password hasheado (BCrypt) |
| `usuario_roles` | Relación M:N usuario ↔ rol |
| `pedidos` | Órdenes de compra (transaccionales) |
| `detalle_pedido` | Líneas de cada pedido (ref. MongoDB ObjectId) |
| `direcciones` | Direcciones de envío |
| `metodos_pago` | Métodos de pago tokenizados |
| `facturas` | Facturación electrónica |
| `envios` | Seguimiento de envíos |

Incluye datos iniciales: 4 roles, 1 tienda por defecto, 2 usuarios de prueba
(admin/cliente) con contraseña `admin123`.

### Ejecución
```bash
psql -U postgres -d ecommerce_db < postgresql-init.sql
```
O automáticamente vía Flyway en el backend Quarkus.
