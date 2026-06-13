package bo.com.proj.entity;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;
import java.time.LocalDateTime;

@MongoEntity(collection = "resenas")
public class Resena extends PanacheMongoEntity {
    public String productoId;
    public String usuarioId;        // UUID desde PostgreSQL
    public Integer calificacion;    // 1-5
    public String comentario;
    public LocalDateTime fecha = LocalDateTime.now();
}