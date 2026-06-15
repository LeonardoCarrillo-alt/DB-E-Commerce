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

@Path("/carrito")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Carrito", description = "Gestión del carrito de compras")
public class CarritoResource {
    
    @Inject
    CarritoService carritoService;
    
    @Context
    SecurityContext securityContext;
    
    @HeaderParam("X-Session-Id")
    String sessionId;
    
    @HeaderParam("X-Invitado")
    Boolean esInvitado;
    
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
    public Response agregarItem(@Valid AgregarItemDTO dto) {
        String usuarioId = getCurrentUserId();
        Boolean invitado = esInvitado != null && esInvitado;
        
        if (invitado && sessionId != null) {
            dto.usuarioId = sessionId;
        } else {
            dto.usuarioId = usuarioId;
        }
        dto.usuarioEmail = securityContext.getUserPrincipal() != null ? 
                          securityContext.getUserPrincipal().getName() : null;
        
        CarritoDTO carrito = carritoService.agregarItem(dto, invitado);
        return Response.ok(carrito).build();
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