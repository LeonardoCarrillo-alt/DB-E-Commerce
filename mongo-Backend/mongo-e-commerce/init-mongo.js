db = db.getSiblingDB('ecommerce_multitienda');

db.createCollection("productos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre", "precio", "categoria", "tienda_id"],
      properties: {
        nombre: { bsonType: "string" },
        precio: { bsonType: "decimal" },
        categoria: { enum: ["ropa", "electronica", "muebles", "adornos", "utensilios_cocina"] },
        tienda_id: { bsonType: "string" },
        atributos: { bsonType: "object" }
      }
    }
  }
});

db.createCollection("carritos");
db.createCollection("resenas");
db.createCollection("historial_busquedas");
db.createCollection("inventario");
db.createCollection("promociones");

db.productos.createIndex({ categoria: 1, precio: 1 });
db.productos.createIndex({ tienda_id: 1 });
db.productos.createIndex({ "atributos.marca": 1 });
db.productos.createIndex({ nombre: "text", descripcion: "text" });
db.carritos.createIndex({ usuario_id: 1 }, { unique: true });
db.resenas.createIndex({ producto_id: 1, fecha: -1 });

print("MongoDB inicializado correctamente para E-Commerce Multitienda");