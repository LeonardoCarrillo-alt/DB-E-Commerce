package bo.com.proj.resource;

import bo.com.proj.dto.*;
import bo.com.proj.service.PromocionService;
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
import java.util.List;

@Path("/promociones")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Promociones", description = "Gestión de promociones y cupones")
public class PromocionResource {
    
    @Inject
    PromocionService promocionService;
    
    @Context
    SecurityContext securityContext;
    
    // Aplicar cupón al carrito (cliente)
    @POST
    @Path("/aplicar")
    @PermitAll
    @Operation(summary = "Aplicar un cupón de descuento al carrito actual")
    public Response aplicarCupon(@Valid AplicarPromocionDTO dto, 
                                  CalcularDescuentoDTO carrito) {
        // En producción, el carrito se obtiene del servicio de carrito
        ResultadoPromocionDTO resultado = promocionService.aplicarPromocionPorCodigo(dto, carrito);
        
        if (!resultado.errores.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(resultado.errores)
                .build();
        }
        
        return Response.ok(resultado).build();
    }
    
    // Listar promociones vigentes (público)
    @GET
    @Path("/vigentes")
    @PermitAll
    @Operation(summary = "Listar todas las promociones vigentes")
    public Response listarVigentes() {
        List<PromocionDTO> promociones = promocionService.listarPromocionesVigentes();
        return Response.ok(promociones).build();
    }
    
    // Crear promoción (solo admin)
    @POST
    @RolesAllowed({"ADMIN_TIENDA", "SUPER_ADMIN"})
    @Operation(summary = "Crear una nueva promoción (solo admin)")
    public Response crearPromocion(@Valid PromocionDTO dto) {
        String creadoPor = securityContext.getUserPrincipal().getName();
        PromocionDTO creada = promocionService.crearPromocion(dto, creadoPor);
        return Response.status(Response.Status.CREATED).entity(creada).build();
    }
    
    // Eliminar promoción (solo admin)
    @DELETE
    @Path("/{id}")
    @RolesAllowed({"ADMIN_TIENDA", "SUPER_ADMIN"})
    @Operation(summary = "Eliminar una promoción (solo admin)")
    public Response eliminarPromocion(@PathParam("id") String id) {
        promocionService.eliminarPromocion(id);
        return Response.noContent().build();
    }
}