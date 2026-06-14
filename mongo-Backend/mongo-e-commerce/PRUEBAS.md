# Guía de Pruebas — Endpoints sin PostgreSQL

> Prerrequisitos:
> - MongoDB corriendo en `localhost:27017`
> - Proyecto levantado con `./mvnw quarkus:dev`
> - Base URL: `http://localhost:8080`
> - Swagger UI: `http://localhost:8080/q/swagger-ui`

---

## 1. Productos

### Listar todos los productos
```http
GET http://localhost:8080/productos
```

---

### Obtener producto por ID
```http
GET http://localhost:8080/productos/{id}
```
> Reemplaza `{id}` con un ObjectId válido de MongoDB, ej: `684f1a2b3c4d5e6f7a8b9c0d`

---

### Búsqueda simple con filtros dinámicos
```http
POST http://localhost:8080/productos/buscar
Content-Type: application/json

{
  "categoria": "ropa",
  "precioMin": 50.00,
  "precioMax": 200.00,
  "tiendaId": "tienda-uuid-001",
  "atributos": {
    "talla": "M",
    "color": "rojo"
  }
}
```

---

## 2. Búsqueda

### Búsqueda avanzada con paginación y facets
```http
POST http://localhost:8080/busqueda/productos
Content-Type: application/json

{
  "query": "camisa",
  "categoria": "ropa",
  "precioMin": 30.00,
  "precioMax": 150.00,
  "ordenarPor": "precio",
  "ordenDireccion": "asc",
  "pagina": 1,
  "limite": 10
}
```

---

### Búsqueda simple por query params
```http
GET http://localhost:8080/busqueda/productos?q=camisa&categoria=ropa&precio_min=30&precio_max=150&pagina=1&limite=10&ordenar=precio&dir=asc
```

Parámetros disponibles:
| Param | Descripción | Default |
|-------|-------------|---------|
| `q` | Texto a buscar | — |
| `categoria` | Categoría del producto | — |
| `precio_min` | Precio mínimo | — |
| `precio_max` | Precio máximo | — |
| `pagina` | Número de página | `1` |
| `limite` | Items por página | `20` |
| `ordenar` | Campo de ordenamiento (`nombre`, `precio`, `fechaCreacion`, `popularidad`) | `fechaCreacion` |
| `dir` | Dirección (`asc`, `desc`) | `desc` |

---

### Autocompletado
```http
GET http://localhost:8080/busqueda/autocompletar?q=cam
```
> Mínimo 2 caracteres. Retorna sugerencias de nombres, categorías y marcas.

---

### Productos destacados
```http
GET http://localhost:8080/busqueda/destacados?limite=5
```
```http
GET http://localhost:8080/busqueda/destacados?categoria=electronica&limite=8
```

---

### Productos relacionados
```http
GET http://localhost:8080/busqueda/relacionados/{productoId}?categoria=ropa&limite=6
```

---

## 3. Carrito

> El carrito soporta usuarios invitados mediante headers opcionales:
> - `X-Session-Id: <sessionId>` — identificador de sesión del invitado
> - `X-Invitado: true` — indica que es usuario invitado

### Obtener carrito actual
```http
GET http://localhost:8080/carrito
X-Session-Id: session-invitado-001
X-Invitado: true
```
> Si no existe carrito, lo crea automáticamente.

---

### Agregar producto al carrito
```http
POST http://localhost:8080/carrito/items
Content-Type: application/json
X-Session-Id: session-invitado-001
X-Invitado: true

{
  "productoId": "684f1a2b3c4d5e6f7a8b9c0d",
  "cantidad": 2,
  "variante": "talla-M-color-rojo"
}
```
> `variante` es opcional. Si el producto ya está en el carrito con la misma variante, suma la cantidad.

---

### Agregar producto sin variante
```http
POST http://localhost:8080/carrito/items
Content-Type: application/json
X-Session-Id: session-invitado-001
X-Invitado: true

{
  "productoId": "684f1a2b3c4d5e6f7a8b9c0d",
  "cantidad": 1
}
```

---

### Actualizar cantidad de un ítem
```http
PUT http://localhost:8080/carrito/items
Content-Type: application/json
X-Session-Id: session-invitado-001
X-Invitado: true

{
  "productoId": "684f1a2b3c4d5e6f7a8b9c0d",
  "cantidad": 5,
  "variante": "talla-M-color-rojo"
}
```
> Si `cantidad` es `0`, elimina el ítem del carrito.

---

### Eliminar un producto del carrito
```http
DELETE http://localhost:8080/carrito/items/684f1a2b3c4d5e6f7a8b9c0d
X-Session-Id: session-invitado-001
X-Invitado: true
```
```http
DELETE http://localhost:8080/carrito/items/684f1a2b3c4d5e6f7a8b9c0d?variante=talla-M-color-rojo
X-Session-Id: session-invitado-001
X-Invitado: true
```

---

### Vaciar carrito completo
```http
DELETE http://localhost:8080/carrito
X-Session-Id: session-invitado-001
X-Invitado: true
```

---

### Resumen de checkout
```http
GET http://localhost:8080/carrito/checkout/resumen
X-Session-Id: session-invitado-001
X-Invitado: true
```
> Valida stock de todos los ítems antes de retornar. Si algún producto no tiene stock suficiente retorna `400`.

---

## 4. Inventario

### Consultar stock de un producto
```http
GET http://localhost:8080/inventario/stock/684f1a2b3c4d5e6f7a8b9c0d
```
```http
GET http://localhost:8080/inventario/stock/684f1a2b3c4d5e6f7a8b9c0d?variante=talla-M-color-rojo
```

---

## 5. Promociones

### Listar promociones vigentes
```http
GET http://localhost:8080/promociones/vigentes
```

---

## Flujo de prueba sugerido

Sigue este orden para tener datos encadenados:

```
1. GET  /productos                         → ver productos existentes (tomar un ID)
2. GET  /inventario/stock/{productoId}     → verificar que tiene stock
3. POST /carrito/items                     → agregar ese producto al carrito
4. GET  /carrito                           → ver el carrito con el ítem agregado
5. PUT  /carrito/items                     → cambiar la cantidad
6. GET  /carrito/checkout/resumen          → validar stock antes de pagar
7. GET  /busqueda/productos?q=...          → probar búsqueda
8. GET  /busqueda/autocompletar?q=...      → probar autocompletado
9. GET  /promociones/vigentes              → ver promociones activas
10. DELETE /carrito                        → limpiar el carrito
```

---

## Datos de prueba — Insertar en MongoDB

Si la base está vacía, inserta estos documentos directamente en MongoDB para tener datos con qué probar.

### Colección `productos`
```json
db.productos.insertMany([
  {
    "nombre": "Camisa Oxford Slim Fit",
    "descripcion": "Camisa de algodón premium, corte slim",
    "precio": 89.99,
    "categoria": "ropa",
    "tiendaId": "tienda-uuid-001",
    "atributos": { "talla": "M", "color": "blanco", "material": "algodón" },
    "activo": true,
    "fechaCreacion": new Date()
  },
  {
    "nombre": "Laptop HP 15 pulgadas",
    "descripcion": "Laptop con procesador Intel i5, 8GB RAM",
    "precio": 3500.00,
    "categoria": "electronica",
    "tiendaId": "tienda-uuid-002",
    "atributos": { "marca": "HP", "ram": "8GB", "almacenamiento": "512GB SSD" },
    "activo": true,
    "fechaCreacion": new Date()
  },
  {
    "nombre": "Silla Ergonómica Pro",
    "descripcion": "Silla de oficina con soporte lumbar ajustable",
    "precio": 750.00,
    "categoria": "muebles",
    "tiendaId": "tienda-uuid-001",
    "atributos": { "color": "negro", "material": "malla", "ajustable": true },
    "activo": true,
    "fechaCreacion": new Date()
  }
])
```

### Colección `inventario`
```json
db.inventario.insertMany([
  {
    "productoId": "<ObjectId del producto 1>",
    "tiendaId": "tienda-uuid-001",
    "variante": null,
    "stockDisponible": 25,
    "stockReservado": 0,
    "stockTotal": 25,
    "umbralAlerta": 5,
    "umbralCritico": 2,
    "activo": true,
    "agotado": false,
    "historialMovimientos": [],
    "fechaCreacion": new Date(),
    "fechaActualizacion": new Date()
  }
])
```

### Colección `promociones`
```json
db.promociones.insertOne({
  "nombre": "Descuento Bienvenida",
  "codigo": "BIENVENIDO10",
  "tipo": "PORCENTAJE",
  "valor": 10,
  "montoMinimoCompra": 100,
  "activo": true,
  "apilable": false,
  "prioridad": 1,
  "fechaInicio": new Date("2025-01-01"),
  "fechaFin": new Date("2026-12-31"),
  "usosMaximos": 1000,
  "usosActuales": 0,
  "usosPorUsuario": 1,
  "fechaCreacion": new Date()
})
```
