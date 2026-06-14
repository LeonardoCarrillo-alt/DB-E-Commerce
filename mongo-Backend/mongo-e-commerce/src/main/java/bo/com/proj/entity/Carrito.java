package bo.com.proj.entity;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@MongoEntity(collection = "carritos")
public class Carrito extends PanacheMongoEntity {
    
    public String usuarioId;           
    public String usuarioEmail;      
    public List<ItemCarrito> items = new ArrayList<>();
    public BigDecimal subtotal = BigDecimal.ZERO;
    public BigDecimal descuento = BigDecimal.ZERO;
    public BigDecimal total = BigDecimal.ZERO;
    public String codigoPromocion;     
    public LocalDateTime fechaCreacion = LocalDateTime.now();
    public LocalDateTime fechaActualizacion = LocalDateTime.now();
    public String estado = "ACTIVO";    
    public Boolean invitado = false;    
    
    public static class ItemCarrito {
        public String productoId;       
        public String nombreProducto;   
        public String categoria;
        public String tiendaId;         
        public Integer cantidad;
        public BigDecimal precioUnitario;
        public BigDecimal subtotal;     
        public String imagenUrl;        
        public String variante;         
        public LocalDateTime fechaAgregado = LocalDateTime.now();
    }
    
    public void recalcularTotales() {
        this.subtotal = items.stream()
                .map(i -> i.subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.total = this.subtotal.subtract(this.descuento);
        this.fechaActualizacion = LocalDateTime.now();
    }
    
    public void agregarItem(ItemCarrito nuevoItem) {
        for (ItemCarrito item : items) {
            if (item.productoId.equals(nuevoItem.productoId) && 
                isSameVariant(item.variante, nuevoItem.variante)) {
                item.cantidad += nuevoItem.cantidad;
                item.subtotal = item.precioUnitario.multiply(BigDecimal.valueOf(item.cantidad));
                item.fechaAgregado = LocalDateTime.now();
                recalcularTotales();
                return;
            }
        }
        items.add(nuevoItem);
        recalcularTotales();
    }
    
    public void eliminarItem(String productoId, String variante) {
        items.removeIf(item -> 
            item.productoId.equals(productoId) && isSameVariant(item.variante, variante)
        );
        recalcularTotales();
    }
    
    public void actualizarCantidad(String productoId, String variante, Integer nuevaCantidad) {
        for (ItemCarrito item : items) {
            if (item.productoId.equals(productoId) && isSameVariant(item.variante, variante)) {
                if (nuevaCantidad <= 0) {
                    eliminarItem(productoId, variante);
                } else {
                    item.cantidad = nuevaCantidad;
                    item.subtotal = item.precioUnitario.multiply(BigDecimal.valueOf(nuevaCantidad));
                }
                recalcularTotales();
                return;
            }
        }
    }
    
    private boolean isSameVariant(String v1, String v2) {
        if (v1 == null && v2 == null) return true;
        if (v1 == null || v2 == null) return false;
        return v1.equals(v2);
    }
    
    public void limpiarCarrito() {
        items.clear();
        subtotal = BigDecimal.ZERO;
        descuento = BigDecimal.ZERO;
        total = BigDecimal.ZERO;
        codigoPromocion = null;
        fechaActualizacion = LocalDateTime.now();
    }
    public static boolean isSameVariantStatic(String v1, String v2) {
    if (v1 == null && v2 == null) return true;
    if (v1 == null || v2 == null) return false;
    return v1.equals(v2);
}
}