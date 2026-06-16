// =============================================================================
// Script de creación de base de datos MongoDB: ecommerce_multitienda
// =============================================================================
// Este script se ejecuta automáticamente al iniciar el contenedor de MongoDB
// vía docker-compose (init-mongo.js montado en /docker-entrypoint-initdb.d/)
// =============================================================================

db = db.getSiblingDB('ecommerce_multitienda');

// ── Colecciones ─────────────────────────────────────────────────────────────

// 1. Productos (catálogo con esquema dinámico BSON)
db.createCollection("productos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre", "precio", "categoria", "tienda_id"],
      properties: {
        nombre:            { bsonType: "string" },
        descripcion:       { bsonType: "string" },
        precio:            { bsonType: "decimal" },
        categoria:         { enum: ["ropa", "electronica", "muebles", "adornos", "utensilios_cocina"] },
        tienda_id:         { bsonType: "string" },
        atributos:         { bsonType: "object" },
        activo:            { bsonType: "bool" },
        popularidad:       { bsonType: "int" },
        fecha_creacion:    { bsonType: "date" }
      }
    }
  }
});

// 2. Carritos de compra
db.createCollection("carritos");

// 3. Reseñas de productos
db.createCollection("resenas");

// 4. Historial de búsquedas
db.createCollection("historial_busquedas");

// 5. Inventario / stock
db.createCollection("inventario");

// 6. Promociones y descuentos
db.createCollection("promociones");

// ── Índices: Productos ──────────────────────────────────────────────────────

// Text search compuesto (nombre, descripción, marca)
db.productos.createIndex(
  {
    nombre: "text",
    descripcion: "text",
    "atributos.marca": "text"
  },
  {
    name: "idx_text_busqueda",
    default_language: "spanish",
    weights: { nombre: 10, descripcion: 5, "atributos.marca": 3 }
  }
);

db.productos.createIndex({ categoria: 1, precio: 1 },          { name: "idx_categoria_precio" });
db.productos.createIndex({ tienda_id: 1, activo: 1 },          { name: "idx_tienda_activo" });
db.productos.createIndex({ precio: 1 },                        { name: "idx_precio" });
db.productos.createIndex({ fecha_creacion: -1 },               { name: "idx_fecha_creacion" });
db.productos.createIndex({ popularidad: -1 },                  { name: "idx_popularidad" });
db.productos.createIndex({ "atributos.marca": 1 },             { name: "idx_atributos_marca" });
db.productos.createIndex({ "atributos.talla": 1 },             { name: "idx_atributos_talla" });
db.productos.createIndex({ "atributos.color": 1 },             { name: "idx_atributos_color" });

// ── Índices: Carritos ───────────────────────────────────────────────────────

db.carritos.createIndex({ usuario_id: 1 },                     { unique: true, name: "idx_usuario_unique" });
db.carritos.createIndex({ usuario_id: 1, estado: 1 },         { name: "idx_usuario_estado" });
db.carritos.createIndex({ estado: 1, fecha_actualizacion: 1 },{ name: "idx_estado_fecha" });
db.carritos.createIndex({ invitado: 1, usuario_id: 1 },        { name: "idx_invitado_usuario" });

// ── Índices: Reseñas ────────────────────────────────────────────────────────

db.resenas.createIndex({ producto_id: 1, fecha: -1 },         { name: "idx_producto_fecha" });
db.resenas.createIndex({ calificacion: 1 },                    { name: "idx_calificacion" });

// ── Índices: Inventario ─────────────────────────────────────────────────────

db.inventario.createIndex({ producto_id: 1, variante: 1 },     { unique: true, name: "idx_producto_variante" });
db.inventario.createIndex({ tienda_id: 1, stock_disponible: 1 }, { name: "idx_tienda_stock" });
db.inventario.createIndex({ tienda_id: 1, agotado: 1 },        { name: "idx_tienda_agotado" });
db.inventario.createIndex({ fecha_actualizacion: 1 },           { name: "idx_fecha_actualizacion" });
db.inventario.createIndex({ stock_reservado: 1, fecha_actualizacion: 1 }, { name: "idx_reservas_expiradas" });

// ── Índices: Historial de búsquedas ─────────────────────────────────────────

db.historial_busquedas.createIndex({ usuario_id: 1, fecha: -1 }, { name: "idx_usuario_fecha" });
db.historial_busquedas.createIndex({ termino: 1 },              { name: "idx_termino" });
db.historial_busquedas.createIndex({ fecha: 1 },                { name: "idx_fecha_limpieza" });

// ── Índices: Promociones ────────────────────────────────────────────────────

db.promociones.createIndex({ codigo: 1 },                       { unique: true, name: "idx_codigo_unique" });
db.promociones.createIndex({ activo: 1, fecha_inicio: 1, fecha_fin: 1 }, { name: "idx_activo_fechas" });

print("[MongoDB] Base de datos 'ecommerce_multitienda' inicializada correctamente");
