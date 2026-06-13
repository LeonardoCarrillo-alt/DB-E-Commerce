package bo.com.proj.entity;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@MongoEntity(collection = "carritos")
public class Carrito extends PanacheMongoEntity {
    public String usuarioId;        // UUID del usuario (desde PostgreSQL)
    public List<ItemCarrito> items = new ArrayList<>();
    public LocalDateTime fechaActualizacion = LocalDateTime.now();
    public Boolean activo = true;

    public static class ItemCarrito {
        public String productoId;    // ObjectId de MongoDB
        public Integer cantidad;
        public BigDecimal precioUnitario;
    }
}