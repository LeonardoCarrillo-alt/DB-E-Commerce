package bo.com.proj.entity;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@MongoEntity(collection = "inventario")
public class Inventario extends PanacheMongoEntity {
    
    public String productoId;           // ID del producto (MongoDB ObjectId)
    public String sku;                  // Código único por variante (ej: "CAMISA-ROJA-XL")
    public String tiendaId;             // UUID de la tienda (desde PostgreSQL)
    public String variante;             // Talla, color, etc. (JSON como String)
    
    // Cantidades
    public Integer stockDisponible = 0;     // Stock que se puede comprar
    public Integer stockReservado = 0;      // Stock reservado por carritos en checkout
    public Integer stockTotal = 0;          // stockDisponible + stockReservado
    
    // Umbrales
    public Integer umbralAlerta = 5;        // Stock mínimo para alerta
    public Integer umbralCritico = 2;       // Stock crítico (agotándose)
    
    // Estados
    public Boolean activo = true;
    public Boolean agotado = false;
    
    // Auditoría
    public LocalDateTime fechaActualizacion = LocalDateTime.now();
    public LocalDateTime fechaCreacion = LocalDateTime.now();
    
    // Historial de movimientos (últimos 100)
    public List<MovimientoStock> historialMovimientos = new ArrayList<>();
    
    // Clase interna para movimientos
    public static class MovimientoStock {
        public String tipo;              // COMPRA, RESERVA, CONFIRMACION, CANCELACION, REABASTECIMIENTO
        public Integer cantidad;
        public String referenciaId;      // carritoId, orderId, etc.
        public String usuarioId;
        public String motivo;
        public LocalDateTime fecha = LocalDateTime.now();
    }
    
    // Métodos de negocio
    public boolean tieneStockDisponible(int cantidad) {
        return stockDisponible >= cantidad;
    }
    
    public boolean reservarStock(int cantidad, String carritoId, String usuarioId) {
        if (!tieneStockDisponible(cantidad)) {
            return false;
        }
        
        stockDisponible -= cantidad;
        stockReservado += cantidad;
        
        // Registrar movimiento
        MovimientoStock movimiento = new MovimientoStock();
        movimiento.tipo = "RESERVA";
        movimiento.cantidad = cantidad;
        movimiento.referenciaId = carritoId;
        movimiento.usuarioId = usuarioId;
        movimiento.motivo = "Reserva por checkout";
        historialMovimientos.add(movimiento);
        
        actualizarEstados();
        fechaActualizacion = LocalDateTime.now();
        return true;
    }
    
    public void confirmarReserva(int cantidad, String orderId, String usuarioId) {
        stockReservado -= cantidad;
        
        MovimientoStock movimiento = new MovimientoStock();
        movimiento.tipo = "CONFIRMACION";
        movimiento.cantidad = cantidad;
        movimiento.referenciaId = orderId;
        movimiento.usuarioId = usuarioId;
        movimiento.motivo = "Compra confirmada";
        historialMovimientos.add(movimiento);
        
        actualizarEstados();
        fechaActualizacion = LocalDateTime.now();
    }
    
    public void cancelarReserva(int cantidad, String carritoId, String usuarioId, String motivo) {
        stockDisponible += cantidad;
        stockReservado -= cantidad;
        
        MovimientoStock movimiento = new MovimientoStock();
        movimiento.tipo = "CANCELACION";
        movimiento.cantidad = cantidad;
        movimiento.referenciaId = carritoId;
        movimiento.usuarioId = usuarioId;
        movimiento.motivo = motivo;
        historialMovimientos.add(movimiento);
        
        actualizarEstados();
        fechaActualizacion = LocalDateTime.now();
    }
    
    public void reabastecer(int cantidad, String motivo) {
        stockDisponible += cantidad;
        stockTotal += cantidad;
        
        MovimientoStock movimiento = new MovimientoStock();
        movimiento.tipo = "REABASTECIMIENTO";
        movimiento.cantidad = cantidad;
        movimiento.motivo = motivo;
        historialMovimientos.add(movimiento);
        
        actualizarEstados();
        fechaActualizacion = LocalDateTime.now();
    }
    
    private void actualizarEstados() {
        stockTotal = stockDisponible + stockReservado;
        agotado = stockDisponible <= 0;
    }
    
    public String getNivelStock() {
        if (stockDisponible <= umbralCritico) return "CRITICO";
        if (stockDisponible <= umbralAlerta) return "BAJO";
        return "NORMAL";
    }
}