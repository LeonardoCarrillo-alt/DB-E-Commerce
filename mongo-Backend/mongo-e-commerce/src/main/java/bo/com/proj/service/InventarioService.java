package bo.com.proj.service;

import bo.com.proj.dto.ConfirmarCompraDTO;
import bo.com.proj.dto.ReabastecerStockDTO;
import bo.com.proj.dto.ReservaStockDTO;
import bo.com.proj.entity.Carrito;
import bo.com.proj.entity.Inventario;
import bo.com.proj.exception.ValidationException;
import bo.com.proj.repository.InventarioRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@ApplicationScoped
public class InventarioService {
    
    private static final Logger log = LoggerFactory.getLogger(InventarioService.class);
    
    // Cache en memoria para reservas activas (distribuido usar Redis)
    private final Map<String, ReservaActiva> reservasActivas = new ConcurrentHashMap<>();
    
    @Inject
    InventarioRepository inventarioRepository;
    
    @Inject
    CarritoService carritoService;
    
    // Obtener stock de un producto
    public int getStockByProducto(String productoId) {
        return getStockDisponible(productoId, null);
    }

    // Obtener stock de un producto con variante
    public int getStockDisponible(String productoId, String variante) {
        Inventario inv = inventarioRepository.findByProductoIdAndVariante(productoId, variante);
        return inv != null ? inv.stockDisponible : 0;
    }
    
    // Obtener stock total (disponible + reservado)
    public int getStockTotal(String productoId, String variante) {
        Inventario inv = inventarioRepository.findByProductoIdAndVariante(productoId, variante);
        return inv != null ? inv.stockTotal : 0;
    }
    
    // Validar stock para múltiples items (antes de checkout)
    public Map<String, Boolean> validarStockItems(Carrito carrito) {
        Map<String, Boolean> resultados = new HashMap<>();
        
        for (Carrito.ItemCarrito item : carrito.items) {
            Inventario inv = inventarioRepository.findByProductoIdAndVariante(
                item.productoId, item.variante
            );
            
            boolean disponible = inv != null && inv.tieneStockDisponible(item.cantidad);
            resultados.put(item.productoId + "|" + item.variante, disponible);
        }
        
        return resultados;
    }
    
    // Reservar stock para un carrito completo (al iniciar checkout)
    @Transactional
    public String reservarStockCarrito(ReservaStockDTO dto) {
        String reservaId = UUID.randomUUID().toString();
        List<ReservaItem> reservasRealizadas = new ArrayList<>();
        
        try {
            // Validar y reservar cada item
            for (ReservaStockDTO.ItemReservaDTO item : dto.items) {
                Inventario inv = inventarioRepository.findByProductoIdAndVariante(
                    item.productoId, item.variante
                );
                
                if (inv == null) {
                    throw new ValidationException("Producto no encontrado: " + item.productoId);
                }
                
                if (!inv.tieneStockDisponible(item.cantidad)) {
                    throw new ValidationException(
                        "Stock insuficiente para producto: " + item.productoId +
                        ". Disponible: " + inv.stockDisponible + ", Solicitado: " + item.cantidad
                    );
                }
                
                // Realizar reserva
                boolean exito = inv.reservarStock(item.cantidad, dto.carritoId, dto.usuarioId);
                if (!exito) {
                    throw new ValidationException("Error al reservar stock para: " + item.productoId);
                }
                
                inventarioRepository.update(inv);
                
                reservasRealizadas.add(new ReservaItem(
                    item.productoId, item.variante, item.cantidad, inv.id.toString()
                ));
            }
            
            // Guardar reserva activa en memoria (o Redis en producción)
            reservasActivas.put(reservaId, new ReservaActiva(
                reservaId, dto.carritoId, dto.usuarioId, reservasRealizadas, LocalDateTime.now()
            ));
            
            log.info("Reserva creada: {} para carrito: {}", reservaId, dto.carritoId);
            return reservaId;
            
        } catch (Exception e) {
            // Rollback: liberar reservas ya hechas
            for (ReservaItem reserva : reservasRealizadas) {
                liberarReserva(reserva.productoId, reserva.variante, reserva.cantidad, dto.carritoId, "Error en checkout");
            }
            throw e;
        }
    }
    
    // Confirmar compra (convertir reservas en ventas)
    @Transactional
    public void confirmarCompra(ConfirmarCompraDTO dto) {
        ReservaActiva reserva = reservasActivas.get(dto.reservaId);
        
        if (reserva == null) {
            throw new ValidationException("Reserva no encontrada o expirada");
        }
        
        for (ReservaItem item : reserva.items) {
            Inventario inv = inventarioRepository.findByProductoIdAndVariante(
                item.productoId, item.variante
            );
            
            if (inv == null) continue;
            
            inv.confirmarReserva(item.cantidad, dto.orderId, reserva.usuarioId);
            inventarioRepository.update(inv);
        }
        
        // Remover reserva activa
        reservasActivas.remove(dto.reservaId);
        log.info("Compra confirmada: {} para reserva: {}", dto.orderId, dto.reservaId);
    }
    
    // Cancelar reserva (checkout fallido, carrito expirado, usuario cancela)
    @Transactional
    public void cancelarReserva(String reservaId, String motivo) {
        ReservaActiva reserva = reservasActivas.remove(reservaId);
        
        if (reserva == null) {
            log.warn("Reserva no encontrada para cancelar: {}", reservaId);
            return;
        }
        
        for (ReservaItem item : reserva.items) {
            liberarReserva(item.productoId, item.variante, item.cantidad, reserva.carritoId, motivo);
        }
        
        log.info("Reserva cancelada: {} - Motivo: {}", reservaId, motivo);
    }
    
    // Liberar reserva individual
    private void liberarReserva(String productoId, String variante, int cantidad, String carritoId, String motivo) {
        Inventario inv = inventarioRepository.findByProductoIdAndVariante(productoId, variante);
        if (inv != null) {
            inv.cancelarReserva(cantidad, carritoId, "sistema", motivo);
            inventarioRepository.update(inv);
        }
    }
    
    // Reabastecer producto
    @Transactional
    public void reabastecer(ReabastecerStockDTO dto) {
        Inventario inv = inventarioRepository.findByProductoIdAndVariante(dto.productoId, dto.variante);
        
        if (inv == null) {
            // Crear nuevo registro de inventario
            inv = new Inventario();
            inv.productoId = dto.productoId;
            inv.variante = dto.variante;
            inv.stockDisponible = 0;
            inv.stockReservado = 0;
            inv.stockTotal = 0;
        }
        
        inv.reabastecer(dto.cantidad, dto.motivo != null ? dto.motivo : "Reabastecimiento manual");
        inventarioRepository.persistOrUpdate(inv);
        
        log.info("Reabastecido {} unidades de producto: {}", dto.cantidad, dto.productoId);
    }
    
    // Limpiar reservas expiradas (job programado)
    @Transactional
    public int limpiarReservasExpiradas(int minutosExpiracion) {
        LocalDateTime fechaLimite = LocalDateTime.now().minusMinutes(minutosExpiracion);
        List<Inventario> inventariosConReservas = inventarioRepository.findReservasExpiradas(fechaLimite);
        
        int totalLiberadas = 0;
        
        for (Inventario inv : inventariosConReservas) {
            // Buscar movimientos de reserva antiguos en el historial
            int cantidadExpirada = inv.stockReservado; // Simplificado: idealmente identificar reservas específicas
            
            if (cantidadExpirada > 0) {
                inv.cancelarReserva(cantidadExpirada, "sistema", "Reserva expirada", "Timeout de checkout");
                inventarioRepository.update(inv);
                totalLiberadas += cantidadExpirada;
            }
        }
        
        log.info("Liberadas {} unidades de stock por expiración", totalLiberadas);
        return totalLiberadas;
    }
    
    // Obtener alertas de stock bajo
    public List<AlertaStockDTO> getAlertasStockBajo(String tiendaId) {
        List<AlertaStockDTO> alertas = new ArrayList<>();
        
        List<Inventario> stockBajo = inventarioRepository.findProductosConStockBajo(tiendaId);
        for (Inventario inv : stockBajo) {
            AlertaStockDTO alerta = new AlertaStockDTO();
            alerta.productoId = inv.productoId;
            alerta.variante = inv.variante;
            alerta.stockActual = inv.stockDisponible;
            alerta.umbral = inv.umbralAlerta;
            alerta.nivel = inv.getNivelStock();
            alertas.add(alerta);
        }
        
        return alertas;
    }
    
    // Clases auxiliares
    private static class ReservaActiva {
        String reservaId;
        String carritoId;
        String usuarioId;
        List<ReservaItem> items;
        LocalDateTime fechaCreacion;
        
        ReservaActiva(String reservaId, String carritoId, String usuarioId, 
                      List<ReservaItem> items, LocalDateTime fechaCreacion) {
            this.reservaId = reservaId;
            this.carritoId = carritoId;
            this.usuarioId = usuarioId;
            this.items = items;
            this.fechaCreacion = fechaCreacion;
        }
    }
    
    private static class ReservaItem {
        String productoId;
        String variante;
        int cantidad;
        String inventarioId;
        
        ReservaItem(String productoId, String variante, int cantidad, String inventarioId) {
            this.productoId = productoId;
            this.variante = variante;
            this.cantidad = cantidad;
            this.inventarioId = inventarioId;
        }
    }
    
    public static class AlertaStockDTO {
        public String productoId;
        public String variante;
        public Integer stockActual;
        public Integer umbral;
        public String nivel; // NORMAL, BAJO, CRITICO
    }
}