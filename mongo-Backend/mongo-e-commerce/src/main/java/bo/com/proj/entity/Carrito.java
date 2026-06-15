package bo.com.proj.entity;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;
import org.bson.codecs.pojo.annotations.BsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@MongoEntity(collection = "carritos")
public class Carrito extends PanacheMongoEntity {
    
    @BsonProperty("usuario_id")
    public String usuarioId;
    @BsonProperty("usuario_email")
    public String usuarioEmail;
    @BsonProperty("session_id")
    public String sessionId;
    public List<ItemCarrito> items = new ArrayList<>();
    public BigDecimal subtotal = BigDecimal.ZERO;
    public BigDecimal descuento = BigDecimal.ZERO;
    public BigDecimal total = BigDecimal.ZERO;
    @BsonProperty("codigo_promocion")
    public String codigoPromocion;
    @BsonProperty("fecha_creacion")
    public LocalDateTime fechaCreacion = LocalDateTime.now();
    @BsonProperty("fecha_actualizacion")
    public LocalDateTime fechaActualizacion = LocalDateTime.now();
    public String estado = "ACTIVO";
    public Boolean invitado = false;
    
    public static class ItemCarrito {
        @BsonProperty("producto_id")
        public String productoId;
        @BsonProperty("nombre_producto")
        public String nombreProducto;
        public String categoria;
        @BsonProperty("tienda_id")
        public String tiendaId;
        public Integer cantidad;
        @BsonProperty("precio_unitario")
        public BigDecimal precioUnitario;
        public BigDecimal subtotal;
        @BsonProperty("imagen_url")
        public String imagenUrl;
        public String variante;
        @BsonProperty("fecha_agregado")
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