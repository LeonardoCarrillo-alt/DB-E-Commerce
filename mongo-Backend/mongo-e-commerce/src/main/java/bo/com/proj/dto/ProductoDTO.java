package bo.com.proj.dto;

import java.math.BigDecimal;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonProperty;
public class ProductoDTO {
    public String id;
    public String nombre;
    public String descripcion;
    public BigDecimal precio;
    public String categoria;
    @JsonProperty("tiendaId")
    public String tiendaId;
    public Map<String, Object> atributos;
    public Boolean activo;
    public Integer stockDisponible;
    public Boolean disponible;
}