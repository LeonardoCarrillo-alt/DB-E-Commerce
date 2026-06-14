package bo.com.proj.repository;

import bo.com.proj.entity.Carrito;
import io.quarkus.mongodb.panache.PanacheMongoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@ApplicationScoped
public class CarritoRepository implements PanacheMongoRepository<Carrito>{

    public Optional<Carrito> findByUsuarioId(String usuarioId) {
        return find("usuarioId = ?1 and estado = ?2", usuarioId, "ACTIVO").firstResultOptional();
    }

    public Optional<Carrito> findByUsuarioIdAndInvitado(String usuarioId, Boolean invitado) {
        return find("usuarioId = ?1 and invitado = ?2 and estado = ?3", 
                    usuarioId, invitado, "ACTIVO").firstResultOptional();
    }

    public Optional<Carrito> findInvitadoBySessionId(String sessionId) {
        return find("usuarioId = ?1 and invitado = true and estado = ?2", 
                    sessionId, "ACTIVO").firstResultOptional();
    }

    public List<Carrito> findAbandonedCarritos(LocalDateTime fechaLimite) {
        return list("estado = ?1 and fechaActualizacion < ?2", "ACTIVO", fechaLimite);
    }

    public List<Carrito> findHistorialByUsuarioId(String usuarioId) {
        return list("usuarioId = ?1 and estado != ?2 order by fechaCreacion desc", 
                    usuarioId, "ACTIVO");
    }

    public long migrarCarritoInvitado(String sessionId, String usuarioId, String usuarioEmail) {
        return update("usuarioId = ?1, usuarioEmail = ?2, invitado = ?3, fechaActualizacion = ?4",
                      usuarioId, usuarioEmail, false, LocalDateTime.now())
                .where("usuarioId = ?5 and invitado = true", sessionId);
    }

    public boolean marcarComoCompletado(String carritoId) {
        return update("estado = ?1, fechaActualizacion = ?2", "COMPLETADO", LocalDateTime.now()).where("_id = ?3", carritoId) > 0;
    }
    
}
