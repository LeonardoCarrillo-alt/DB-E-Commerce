package bo.com.proj.dto;

import java.math.BigDecimal;
import java.util.Map;

public class FiltroBusquedaDTO {
    public String categoria;
    public BigDecimal precioMin;
    public BigDecimal precioMax;
    public Map<String, Object> atributos;  // filtros dinámicos, ej: {"marca": "Sony"}
    public String tiendaId;
}