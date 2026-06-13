package bo.com.proj.entity;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;

@MongoEntity(collection = "inventario")
public class Inventario extends PanacheMongoEntity {
    public String productoId;
    public Integer stock;
    public Integer umbralAlerta;    // stock mínimo para alerta
    public String tiendaId;         // UUID de la tienda
}