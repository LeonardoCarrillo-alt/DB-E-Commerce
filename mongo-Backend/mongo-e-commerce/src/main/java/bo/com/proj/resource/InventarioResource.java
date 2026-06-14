package bo.com.proj.resource;

import bo.com.proj.dto.ConfirmarCompraDTO;
import bo.com.proj.dto.ReabastecerStockDTO;
import bo.com.proj.dto.ReservaStockDTO;
import bo.com.proj.service.InventarioService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.Map;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/inventario")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Inventario", description = "Gestión de stock y reservas")
public class InventarioResource {
    
    @Inject
    InventarioService inventarioService;
    
    // Consultar stock de un producto (público)
    @GET
    @Path("/stock/{productoId}")
    @Operation(summary = "Consultar stock disponible de un producto")
    public Response getStock(@PathParam("productoId") String productoId,
                             @QueryParam("variante") String variante) {
        int stock = inventarioService.getStockDisponible(productoId, variante);
        return Response.ok(Map.of(
            "productoId", productoId,
            "variante", variante != null ? variante : "default",
            "stockDisponible", stock
        )).build();
    }
    
    // Reservar stock (al iniciar checkout) - Cliente autenticado
    @POST
    @Path("/reservar")
    @RolesAllowed({"CLIENTE", "ADMIN_TIENDA", "SUPER_ADMIN"})
    @Operation(summary = "Reservar stock para checkout")
    public Response reservarStock(@Valid ReservaStockDTO dto) {
        String reservaId = inventarioService.reservarStockCarrito(dto);
        return Response.ok(Map.of(
            "reservaId", reservaId,
            "message", "Stock reservado exitosamente",
            "expiraEn", "15 minutos"
        )).build();
    }
    
    // Confirmar compra (pago exitoso) - Cliente autenticado
    @POST
    @Path("/confirmar")
    @RolesAllowed({"CLIENTE", "ADMIN_TIENDA", "SUPER_ADMIN"})
    @Operation(summary = "Confirmar compra y liberar reservas")
    public Response confirmarCompra(@Valid ConfirmarCompraDTO dto) {
        inventarioService.confirmarCompra(dto);
        return Response.ok(Map.of("message", "Compra confirmada, stock actualizado")).build();
    }
    
    // Cancelar reserva (checkout fallido o usuario cancela)
    @DELETE
    @Path("/reservar/{reservaId}")
    @Operation(summary = "Cancelar reserva de stock")
    public Response cancelarReserva(@PathParam("reservaId") String reservaId,
                                    @QueryParam("motivo") String motivo) {
        inventarioService.cancelarReserva(reservaId, 
            motivo != null ? motivo : "Cancelado por usuario");
        return Response.ok(Map.of("message", "Reserva cancelada, stock liberado")).build();
    }
    
    // Reabastecer producto (solo admin/tienda)
    @POST
    @Path("/reabastecer")
    @RolesAllowed({"ADMIN_TIENDA", "SUPER_ADMIN"})
    @Operation(summary = "Reabastecer stock de un producto")
    public Response reabastecer(@Valid ReabastecerStockDTO dto) {
        inventarioService.reabastecer(dto);
        return Response.ok(Map.of("message", "Stock reabastecido exitosamente")).build();
    }
    
    // Alertas de stock bajo (solo admin/tienda)
    @GET
    @Path("/alertas/{tiendaId}")
    @RolesAllowed({"ADMIN_TIENDA", "SUPER_ADMIN"})
    @Operation(summary = "Obtener alertas de stock bajo")
    public Response getAlertasStockBajo(@PathParam("tiendaId") String tiendaId) {
        var alertas = inventarioService.getAlertasStockBajo(tiendaId);
        return Response.ok(Map.of(
            "tiendaId", tiendaId,
            "alertas", alertas,
            "total", alertas.size()
        )).build();
    }
    
    // Limpiar reservas expiradas (job manual o automático)
    @POST
    @Path("/limpiar-expiradas")
    @RolesAllowed({"SUPER_ADMIN"})
    @Operation(summary = "Limpiar reservas de stock expiradas")
    public Response limpiarReservasExpiradas(@QueryParam("minutos") @DefaultValue("15") int minutos) {
        int liberadas = inventarioService.limpiarReservasExpiradas(minutos);
        return Response.ok(Map.of(
            "reservasLiberadas", liberadas,
            "message", "Reservas expiradas liberadas"
        )).build();
    }
}