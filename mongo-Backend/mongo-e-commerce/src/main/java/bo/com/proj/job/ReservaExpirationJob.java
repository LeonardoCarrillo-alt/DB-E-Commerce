package bo.com.proj.job;

import bo.com.proj.service.InventarioService;
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ApplicationScoped
public class ReservaExpirationJob {
    
    private static final Logger log = LoggerFactory.getLogger(ReservaExpirationJob.class);
    
    @Inject
    InventarioService inventarioService;
    
    // Ejecutar cada 5 minutos
    @Scheduled(every = "300s")
    void limpiarReservasExpiradas() {
        log.info("Ejecutando job de limpieza de reservas expiradas");
        int liberadas = inventarioService.limpiarReservasExpiradas(15); // 15 minutos de expiración
        if (liberadas > 0) {
            log.info("Liberadas {} unidades de stock por expiración", liberadas);
        }
    }
}