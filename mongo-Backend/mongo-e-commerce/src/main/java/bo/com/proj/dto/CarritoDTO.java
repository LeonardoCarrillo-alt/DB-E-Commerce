package bo.com.proj.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class CarritoDTO {

    public String id;
    
    @JsonProperty("usuarioId")
    public String usuarioId;
    
    @JsonProperty("usuarioEmail")
    public String usuarioEmail;
    
    public List<ItemCarritoDTO> items;
    public BigDecimal subtotal;
    public BigDecimal descuento;
    public BigDecimal total;
    
    @JsonProperty("codigoPromocion")
    public String codigoPromocion;
    
    @JsonProperty("fechaCreacion")
    public LocalDateTime fechaCreacion;
    
    @JsonProperty("fechaActualizacion")
    public LocalDateTime fechaActualizacion;
    
    public String estado;
    public Boolean invitado;

    public static class ItemCarritoDTO {
        // 🚨 Forzamos a que en la red se llame "productoId" ignorando el snake_case global
        @JsonProperty("productId")
        public String productId;
        
        // 🚨 Forzamos a que en la red se llame "nombre" para que encaje con CartItemResponse
        @JsonProperty("nombre")
        public String nombreProducto;
        
        public String categoria;
        
        @JsonProperty("tiendaId")
        public String tiendaId;
        
        public Integer cantidad;
        
        // 🚨 Forzamos a que en la red se llame "precio" para tu frontend
        @JsonProperty("precio")
        public BigDecimal precioUnitario;
        
        public BigDecimal subtotal;
        
        @JsonProperty("imagen")
        public String imagenUrl;
        
        public String variante;
        
        @JsonProperty("fechaAgregado")
        public LocalDateTime fechaAgregado;
    }
}