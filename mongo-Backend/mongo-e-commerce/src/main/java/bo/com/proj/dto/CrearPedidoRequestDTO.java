package bo.com.proj.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para crear un pedido desde el checkout
 * Incluye toda la información del carrito necesaria para persistir en PostgreSQL
 */
public class CrearPedidoRequestDTO {
    public String usuarioId;
    public BigDecimal total;
    public String estado;
    public LocalDateTime fechaCreacion;  // ✅ AGREGADO - Importante para auditoria
    public List<ItemPedidoDTO> items;

    /**
     * Cada item del pedido con información completa del producto
     */
    public static class ItemPedidoDTO {
        public String productoId;
        public String nombre;              // ✅ AGREGADO - Nombre del producto
        public Integer cantidad;
        public BigDecimal precioUnitario;
        public BigDecimal subtotal;        // ✅ AGREGADO - Precalculado (cantidad * precioUnitario)
    }
}