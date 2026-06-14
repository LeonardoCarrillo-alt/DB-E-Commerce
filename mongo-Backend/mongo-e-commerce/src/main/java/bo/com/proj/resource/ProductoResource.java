package bo.com.proj.resource;

import bo.com.proj.dto.FiltroBusquedaDTO;
import bo.com.proj.dto.ProductoDTO;
import bo.com.proj.service.AuthService;
import bo.com.proj.service.ProductoService;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;

@Path("/productos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Productos", description = "Gestión del catálogo de productos")
public class ProductoResource {

    @Inject
    ProductoService productoService;

    @Inject
    AuthService authService;

    @GET
    @PermitAll
    @Operation(summary = "Listar todos los productos activos")
    public List<ProductoDTO> listAll() {
        return productoService.listAll();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Obtener un producto por ID")
    public Response findById(@PathParam("id") String id) {
        ProductoDTO dto = productoService.findById(id);
        if (dto == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(dto).build();
    }

    @POST
    @RolesAllowed({"ADMIN_TIENDA", "SUPER_ADMIN"})
    @Operation(summary = "Crear un nuevo producto (solo admin)")
    public Response create(@Valid ProductoDTO dto) {
        if (!authService.canAccessTienda(dto.tiendaId)) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity("No tienes acceso a esta tienda")
                .build();
        }
        ProductoDTO created = productoService.create(dto);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }
    @PUT
    @Path("/{id}")
    @RolesAllowed({"ADMIN_TIENDA", "SUPER_ADMIN", "VENDEDOR"})
    @Operation(summary = "Actualizar producto")
    public Response update(@PathParam("id") String id, ProductoDTO dto) {
        ProductoDTO existing = productoService.findById(id);
        if (existing == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        
        // Vendedor solo puede actualizar productos de su tienda
        if (!authService.canAccessTienda(existing.tiendaId)) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity("No tienes acceso a este producto")
                .build();
        }
        
        ProductoDTO updated = productoService.update(id, dto);
        return Response.ok(updated).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"ADMIN_TIENDA", "SUPER_ADMIN"})
    @Operation(summary = "Eliminar producto (solo admin)")
    public Response delete(@PathParam("id") String id) {
        ProductoDTO existing = productoService.findById(id);
        if (existing == null) return Response.status(Response.Status.NOT_FOUND).build();
        if (!authService.canAccessTienda(existing.tiendaId)) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity("No tienes acceso a este producto")
                .build();
        }
        boolean deleted = productoService.delete(id);
        if (!deleted) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.noContent().build();
    }

    @POST
    @Path("/buscar")
    @Operation(summary = "Búsqueda avanzada con filtros dinámicos")
    public List<ProductoDTO> search(FiltroBusquedaDTO filtro) {
        return productoService.searchDynamic(filtro);
    }
}