package bo.com.proj.repository;

import bo.com.proj.entity.Inventario;
import io.quarkus.mongodb.panache.PanacheMongoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class InventarioRepository implements PanacheMongoRepository<Inventario> {
    
    public Inventario findByProductoId(String productoId) {
        return find("productoId", productoId).firstResult();
    }
    
    public Inventario findBySku(String sku) {
        return find("sku", sku).firstResult();
    }
    
    public Inventario findByProductoIdAndVariante(String productoId, String variante) {
        if (variante == null || variante.trim().isEmpty()) {
            return findByProductoId(productoId);
        }
        return find("productoId = ?1 and variante = ?2", productoId, variante).firstResult();
    }
    
    // Productos con stock bajo (para alertas)
    public List<Inventario> findProductosConStockBajo(String tiendaId) {
        return list("tiendaId = ?1 and stockDisponible <= umbralAlerta and stockDisponible > 0", tiendaId);
    }
    
    public List<Inventario> findProductosConStockCritico(String tiendaId) {
        return list("tiendaId = ?1 and stockDisponible <= umbralCritico and stockDisponible > 0", tiendaId);
    }
    
    public List<Inventario> findProductosAgotados(String tiendaId) {
        return list("tiendaId = ?1 and agotado = true", tiendaId);
    }
    
    // Reservas que expiraron (mayor a 15 minutos sin confirmar)
    public List<Inventario> findReservasExpiradas(LocalDateTime fechaLimite) {
        // Buscar productos que tienen reservas antiguas
        return list("stockReservado > 0 and fechaActualizacion < ?1", fechaLimite);
    }
    
    // Buscar por múltiples IDs (para checkout)
    public List<Inventario> findByProductoIds(List<String> productoIds) {
        return list("productoId in ?1", productoIds);
    }
}