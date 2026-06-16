package bo.com.proj.entity;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;
import org.bson.codecs.pojo.annotations.BsonProperty;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@MongoEntity(collection = "productos")
public class Producto extends PanacheMongoEntity {
    public String nombre;
    public String descripcion;
    public BigDecimal precio;
    public String categoria;        // ropa, electronica, muebles, adornos, utensilios_cocina
    
    @BsonProperty("tienda_id")
    public String tiendaId;         // UUID de la tienda (desde PostgreSQL)
    
    // 🌟 AÑADE ESTOS DOS CAMPOS AQUÍ:
    @BsonProperty("stock_disponible")
    public Integer stockDisponible; // Mapea 'stockDisponible' en Java hacia 'stock_disponible' en Mongo
    
    public Boolean disponible;      // Mapea 'disponible' tal cual a MongoDB

    public Map<String, Object> atributos;  // atributos dinámicos BSON
    public Boolean activo = true;
    public LocalDateTime fechaCreacion = LocalDateTime.now();
}