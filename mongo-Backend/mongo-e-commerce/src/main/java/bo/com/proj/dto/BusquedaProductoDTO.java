package bo.com.proj.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class BusquedaProductoDTO {
    
    // Búsqueda textual
    public String query;                    // Búsqueda por nombre, descripción
    
    // Filtros básicos
    public String categoria;                // ropa, electronica, muebles, adornos, utensilios_cocina
    public String tiendaId;                 // UUID de la tienda
    public List<String> tiendasIds;         // Múltiples tiendas
    
    // Filtros de precio
    public BigDecimal precioMin;
    public BigDecimal precioMax;
    
    // Filtros de atributos dinámicos (ej: {"marca": "Sony", "talla": "XL"})
    public Map<String, Object> atributos;
    
    // Filtros de disponibilidad
    public Boolean soloDisponibles = false;  // Solo productos con stock > 0
    public Boolean soloConDescuento = false; // Productos en promoción
    
    // Ordenamiento
    public String ordenarPor = "fechaCreacion"; // nombre, precio, fechaCreacion, popularidad
    public String ordenDireccion = "desc";      // asc, desc
    
    // Paginación
    public Integer pagina = 1;               // 1-indexed
    public Integer limite = 20;              // Items por página (max 100)
    
    // Búsqueda por rango de fechas
    public String fechaDesde;
    public String fechaHasta;
}