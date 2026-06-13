package bo.com.proj.entity;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@MongoEntity(collection = "promociones")
public class Promocion extends PanacheMongoEntity {
    public String nombre;
    public String tipo;             // porcentaje, monto_fijo, envio_gratis
    public BigDecimal valor;
    public List<String> categoriasAplican;
    public List<String> tiendasAplican;
    public LocalDateTime fechaInicio;
    public LocalDateTime fechaFin;
    public Boolean activo = true;
}