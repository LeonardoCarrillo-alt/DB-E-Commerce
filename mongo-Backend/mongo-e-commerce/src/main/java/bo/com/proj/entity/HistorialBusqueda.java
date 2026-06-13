package bo.com.proj.entity;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;
import java.time.LocalDateTime;

@MongoEntity(collection = "historial_busquedas")
public class HistorialBusqueda extends PanacheMongoEntity {
    public String usuarioId;
    public String termino;
    public LocalDateTime fecha = LocalDateTime.now();
}