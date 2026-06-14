package bo.com.proj.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class CarritoDTO {

    public String id;
    public String usuarioId;
    public String usuarioEmail;
    public List<ItemCarritoDTO> items;
    public BigDecimal subtotal;
    public BigDecimal descuento;
    public BigDecimal total;
    public String codigoPromocion;
    public LocalDateTime fechaCreacion;
    public LocalDateTime fechaActualizacion;
    public String estado;
    public Boolean invitado;

    public static class ItemCarritoDTO {
        public String productoId;
        public String nombreProducto;
        public String categoria;
        public String tiendaId;
        public Integer cantidad;
        public BigDecimal precioUnitario;
        public BigDecimal subtotal;
        public String imagenUrl;
        public String variante;
        public LocalDateTime fechaAgregado;
    }
    
}
