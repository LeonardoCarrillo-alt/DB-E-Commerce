package bo.com.proj.resource;

import bo.com.proj.dto.ActualizarItemDTO;
import bo.com.proj.dto.AgregarItemDTO;
import bo.com.proj.dto.AplicarPromocionDTO;
import bo.com.proj.dto.CarritoDTO;
import bo.com.proj.service.CarritoService;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;
import jakarta.validation.Validator;
import jakarta.validation.ConstraintViolation;
import java.util.Set;

@Path("/carrito")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Carrito", description = "Gestión del carrito de compras")
public class CarritoResource {

    // 🚨 CORREGIDO: Mover el Logger DENTRO de las llaves de la clase
    private static final Logger LOG = Logger.getLogger(CarritoResource.class);
    
    @Inject
    CarritoService carritoService;
    
    @Context
    SecurityContext securityContext;
    
    @HeaderParam("X-Session-Id")
    String sessionId;
    
    @HeaderParam("X-Invitado")
    Boolean esInvitado;

    @Inject
    Validator validator; // Inyectamos el validador manual para el debug
    
    @GET
    @Operation(summary = "Obtener el carrito actual del usuario")
    public Response getCarrito() {
        Boolean invitado = esInvitado != null && esInvitado;
        String idUsuario = invitado && sessionId != null ? sessionId : getCurrentUserId();

        CarritoDTO carrito = carritoService.getCarritoByUsuario(idUsuario, invitado);
        return Response.ok(carrito).build();
    }
    
    @POST
    @Path("/items")
    @Operation(summary = "Agregar un producto al carrito")
    public Response agregarItem(AgregarItemDTO dto) { // Sin @Valid para forzar la entrada y debugear
        
        LOG.info("============== 🕵️ DEBÚG API: PETICIÓN RECIBIDA ==============");
        LOG.info("📥 Headers recibidos:");
        LOG.info("   -> X-Session-Id: " + sessionId);
        LOG.info("   -> X-Invitado: " + esInvitado);
        
        if (dto == null) {
            LOG.error("❌ El objeto AgregarItemDTO llegó completamente NULO (Body vacío o mal JSON)");
            return Response.status(Response.Status.BAD_REQUEST).entity("El cuerpo JSON está vacío").build();
        }

        LOG.info("📦 Body (AgregarItemDTO) recibido:");
        LOG.info("   -> productoId: [" + dto.productoId + "]");
        LOG.info("   -> cantidad: [" + dto.cantidad + "]");
        LOG.info("   -> variante: [" + dto.variante + "]");

        // 🛑 Validamos manualmente para ver si aquí salta el Error 400
        Set<ConstraintViolation<AgregarItemDTO>> violations = validator.validate(dto);
        if (!violations.isEmpty()) {
            LOG.error("❌ FALLÓ LA VALIDACIÓN DE JAKARTA (@NotBlank / @Min):");
            for (ConstraintViolation<AgregarItemDTO> violation : violations) {
                LOG.error("   ⚠️ Campo '" + violation.getPropertyPath() + "': " + violation.getMessage() + " (Valor enviado: " + violation.getInvalidValue() + ")");
            }
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Error de validación: " + violations.iterator().next().getMessage())
                    .build();
        }

        String usuarioId = getCurrentUserId();
        Boolean invitado = esInvitado != null && esInvitado;
        
        if (invitado && sessionId != null) {
            dto.usuarioId = sessionId;
        } else {
            dto.usuarioId = usuarioId;
        }
        
        dto.usuarioEmail = securityContext.getUserPrincipal() != null ? 
                          securityContext.getUserPrincipal().getName() : null;
        
        LOG.info("🚀 Pasando datos correctos al CarritoService...");
        try {
            // 🚨 CORRECCIÓN AQUÍ: Pasar solo los 2 parámetros que requiere tu CarritoService
            CarritoDTO carrito = carritoService.agregarItem(dto, invitado); 
            
            LOG.info("✅ Carrito procesado con éxito por el Service");
            return Response.ok(carrito).build();
        } catch (Exception e) {
            LOG.error("❌ Error dentro de CarritoService: ", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
        }
    }

    @PUT
    @Path("/items")
    @Operation(summary = "Actualizar cantidad de un producto en el carrito")
    public Response actualizarItem(@Valid ActualizarItemDTO dto) {
        String usuarioId = getCurrentUserId();
        Boolean invitado = esInvitado != null && esInvitado;
        
        String idUsuario = invitado && sessionId != null ? sessionId : usuarioId;
        
        CarritoDTO carrito = carritoService.actualizarItem(dto, idUsuario, invitado);
        return Response.ok(carrito).build();
    }
    
    @DELETE
    @Path("/items/{productoId}")
    @Operation(summary = "Eliminar un producto del carrito")
    public Response eliminarItem(
            @PathParam("productoId") String productoId,
            @QueryParam("variante") String variante) {
        String usuarioId = getCurrentUserId();
        Boolean invitado = esInvitado != null && esInvitado;
        
        String idUsuario = invitado && sessionId != null ? sessionId : usuarioId;
        
        CarritoDTO carrito = carritoService.eliminarItem(productoId, variante, idUsuario, invitado);
        return Response.ok(carrito).build();
    }
    
    @DELETE
    @Operation(summary = "Limpiar todo el carrito")
    public Response limpiarCarrito() {
        String usuarioId = getCurrentUserId();
        Boolean invitado = esInvitado != null && esInvitado;
        
        String idUsuario = invitado && sessionId != null ? sessionId : usuarioId;
        
        CarritoDTO carrito = carritoService.limpiarCarrito(idUsuario, invitado);
        return Response.ok(carrito).build();
    }
    
    @POST
    @Path("/promocion")
    @Operation(summary = "Aplicar un cupón de descuento al carrito")
    public Response aplicarPromocion(@Valid AplicarPromocionDTO dto) {
        String usuarioId = getCurrentUserId();
        Boolean invitado = esInvitado != null && esInvitado;
        
        String idUsuario = invitado && sessionId != null ? sessionId : usuarioId;
        
        CarritoDTO carrito = carritoService.aplicarPromocion(dto, idUsuario, invitado);
        return Response.ok(carrito).build();
    }

    @POST
    @Path("/checkout/procesar")
    @Operation(summary = "Procesar checkout y reservar stock")
    public Response procesarCheckout() {
        String usuarioId = getCurrentUserId();
        Boolean invitado = esInvitado != null && esInvitado;
        String idUsuario = invitado && sessionId != null ? sessionId : usuarioId;
        
        var response = carritoService.procesarCheckout(idUsuario, invitado);
        return Response.ok(response).build();
    }

    @DELETE
    @Path("/promocion")
    @Operation(summary = "Quitar el cupón de descuento del carrito")
    public Response quitarPromocion() {
        String usuarioId = getCurrentUserId();
        Boolean invitado = esInvitado != null && esInvitado;
        
        String idUsuario = invitado && sessionId != null ? sessionId : usuarioId;
        
        CarritoDTO carrito = carritoService.quitarPromocion(idUsuario, invitado);
        return Response.ok(carrito).build();
    }
    
    @GET
    @Path("/checkout/resumen")
    @Operation(summary = "Obtener resumen del carrito para proceder al pago")
    public Response getResumenCheckout() {
        String usuarioId = getCurrentUserId();
        Boolean invitado = esInvitado != null && esInvitado;
        
        String idUsuario = invitado && sessionId != null ? sessionId : usuarioId;
        
        CarritoDTO resumen = carritoService.getResumenCheckout(idUsuario, invitado);
        return Response.ok(resumen).build();
    }
    
    @POST
    @Path("/migrar")
    @RolesAllowed({"CLIENTE", "ADMIN_TIENDA", "SUPER_ADMIN"})
    @Operation(summary = "Migrar carrito invitado a usuario registrado (después de login)")
    public Response migrarCarrito(@QueryParam("sessionId") String oldSessionId) {
        String usuarioId = getCurrentUserId();
        String usuarioEmail = securityContext.getUserPrincipal().getName();
        
        CarritoDTO carrito = carritoService.migrarCarritoInvitado(oldSessionId, usuarioId, usuarioEmail);
        return Response.ok(carrito).build();
    }
    
    private String getCurrentUserId() {
        if (securityContext.getUserPrincipal() != null) {
            return securityContext.getUserPrincipal().getName();
        }
        return "usuario-anonimo";
    }
}