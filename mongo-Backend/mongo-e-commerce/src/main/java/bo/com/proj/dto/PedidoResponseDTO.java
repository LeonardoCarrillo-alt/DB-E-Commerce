package bo.com.proj.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO de respuesta para consultas de pedidos
 * IMPORTANTE: Este DTO debe estar en tu microservicio de PostgreSQL
 * y serializar TODOS estos campos para que el frontend funcione correctamente
 */
public class PedidoResponseDTO {
    
    public String id;
    
    public String usuarioId;
    
    public BigDecimal total;
    
    public String estado;
    
    // ✅ CRÍTICO: Campo necesario para que el frontend muestre la fecha
    // Usa camelCase ya que es el estándar en JSON
    @JsonProperty("createdAt")
    public LocalDateTime createdAt;
    
    // ⚠️ OPCIONAL: Si usas snake_case en base de datos, Jackson convertirá:
    // fecha_creacion en JSON a createdAt en la clase
    @JsonProperty("fecha_creacion")
    public LocalDateTime fechaCreacion;
    
    // ✅ CRÍTICO: Items con información completa
    public List<ItemResponseDTO> items;
    
    /**
     * Cada item del pedido con información completa
     * Debe tener EXACTAMENTE estos campos para que el frontend no muestre NaN
     */
    public static class ItemResponseDTO {
        
        // ID del producto
        public String productoId;
        
        // ✅ CRÍTICO: Nombre del producto - OBLIGATORIO
        // Si no existe este campo, el frontend mostrará "BsNaN"
        public String nombre;
        
        // Cantidad pedida
        public Integer cantidad;
        
        // ✅ CRÍTICO: Nombre del campo debe ser "precio" (no precioUnitario)
        // porque el frontend espera "item.precio"
        @JsonProperty("precio")
        public BigDecimal precioUnitario;
        
        // Subtotal del item (cantidad × precio)
        public BigDecimal subtotal;
    }
    
    // Métodos auxiliares para construcción del DTO
    public static ItemResponseDTO createItem(String productoId, String nombre, 
                                             Integer cantidad, BigDecimal precio) {
        ItemResponseDTO item = new ItemResponseDTO();
        item.productoId = productoId;
        item.nombre = nombre;
        item.cantidad = cantidad;
        item.precioUnitario = precio;
        item.subtotal = precio.multiply(new java.math.BigDecimal(cantidad));
        return item;
    }
}

/**
 * MAPPING A LA ENTIDAD JPA (Ejemplo)
 * 
 * Para convertir de tu entidad Order (JPA) a PedidoResponseDTO:
 * 
 * public static PedidoResponseDTO fromEntity(Order order) {
 *     PedidoResponseDTO dto = new PedidoResponseDTO();
 *     dto.id = order.getId().toString();
 *     dto.usuarioId = order.getUsuarioId();
 *     dto.total = order.getTotal();
 *     dto.estado = order.getEstado();
 *     dto.createdAt = order.getCreatedAt();  // ✅ ASEGURAR QUE EXISTE EN ENTITY
 *     dto.items = order.getItems().stream().map(item -> {
 *         ItemResponseDTO itemDto = new ItemResponseDTO();
 *         itemDto.productoId = item.getProductoId();
 *         itemDto.nombre = item.getNombre();           // ✅ ASEGURAR QUE EXISTE
 *         itemDto.cantidad = item.getCantidad();
 *         itemDto.precioUnitario = item.getPrecioUnitario();
 *         itemDto.subtotal = item.getSubtotal();
 *         return itemDto;
 *     }).collect(Collectors.toList());
 *     return dto;
 * }
 */