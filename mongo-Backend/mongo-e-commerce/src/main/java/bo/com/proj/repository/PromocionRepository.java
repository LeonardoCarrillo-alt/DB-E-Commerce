package bo.com.proj.repository;

import bo.com.proj.entity.Promocion;
import io.quarkus.mongodb.panache.PanacheMongoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class PromocionRepository implements PanacheMongoRepository<Promocion> {
    
    // Buscar promoción por código (válida y vigente)
    public Promocion findByCodigoAndVigente(String codigo, LocalDateTime ahora) {
        return find("codigo = ?1 and activo = true and fechaInicio <= ?2 and fechaFin >= ?2",
                    codigo, ahora).firstResult();
    }
    
    // Buscar promociones vigentes para un usuario
    public List<Promocion> findPromocionesVigentesParaUsuario(String usuarioId, String rol, 
                                                               boolean primeraCompra, 
                                                               LocalDateTime ahora) {
        return list("activo = true and " +
                    "fechaInicio <= ?1 and fechaFin >= ?1 and " +
                    "(usuariosEspecificos is null or ?2 in usuariosEspecificos) and " +
                    "(rolesPermitidos is null or ?3 in rolesPermitidos) and " +
                    "(soloPrimeraCompra = false or ?4 = true)",
                    ahora, usuarioId, rol, primeraCompra);
    }
    
    // Buscar promociones automáticas (sin código, aplican automáticamente al carrito)
    public List<Promocion> findPromocionesAutomaticas(LocalDateTime ahora) {
        return list("activo = true and codigo is null and " +
                    "fechaInicio <= ?1 and fechaFin >= ?1 order by prioridad desc",
                    ahora);
    }
    
    // Buscar promociones aplicables a un producto/categoría
    public List<Promocion> findPromocionesPorProducto(String productoId, String categoria, 
                                                       String tiendaId, LocalDateTime ahora) {
        return list("activo = true and fechaInicio <= ?1 and fechaFin >= ?1 and " +
                    "(productosAplican is null or ?2 in productosAplican) and " +
                    "(categoriasAplican is null or ?3 in categoriasAplican) and " +
                    "(tiendasAplican is null or ?4 in tiendasAplican)",
                    ahora, productoId, categoria, tiendaId);
    }
    
    // Promociones con usos disponibles
    public List<Promocion> findPromocionesConUsosDisponibles() {
        return list("activo = true and (usosMaximos is null or usosActuales < usosMaximos)");
    }
    
    // Contar usos de una promoción por usuario
    public long countUsosByUsuario(String promocionId, String usuarioId) {
        // Esto requeriría una colección de usos, por simplicidad retornamos 0
        // En producción: db.promocion_usos.countDocuments({ promocion_id, usuario_id })
        return 0;
    }
}