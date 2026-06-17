package bo.com.proj.resource;

import bo.com.proj.dto.FiltroBusquedaDTO;
import bo.com.proj.dto.ProductoDTO;
import bo.com.proj.service.AuthService;
import bo.com.proj.service.ProductoService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.io.IOException;
import java.nio.file.Files;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Path("/productos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Productos", description = "Gestión del catálogo de productos")
public class ProductoResource {

    private static final long MAX_IMAGE_SIZE = 5L * 1024 * 1024;

    @Inject
    ProductoService productoService;

    @Inject
    AuthService authService;

    @Inject
    ObjectMapper objectMapper;

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
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response create(
            @RestForm("nombre") String nombre,
            @RestForm("descripcion") String descripcion,
            @RestForm("precio") java.math.BigDecimal precio,
            @RestForm("categoria") String categoria,
            @RestForm("tiendaId") String tiendaId,
            @RestForm("atributos") String atributosJson,
            @RestForm("activo") Boolean activo,
            @RestForm("stock_disponible") Integer stockDisponible,
            @RestForm("disponible") Boolean disponible,
            @RestForm("imagen") FileUpload imagen) {
        ProductoDTO dto = buildDto(nombre, descripcion, precio, categoria, tiendaId, atributosJson, activo, stockDisponible, disponible);
        if (!authService.canAccessTienda(dto.tiendaId)) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity("No tienes acceso a esta tienda")
                .build();
        }
        dto.imageBase64 = toImageDataUri(imagen);
        ProductoDTO created = productoService.create(dto);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"ADMIN_TIENDA", "SUPER_ADMIN", "VENDEDOR"})
    @Operation(summary = "Actualizar producto")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response update(
            @PathParam("id") String id,
            @RestForm("nombre") String nombre,
            @RestForm("descripcion") String descripcion,
            @RestForm("precio") java.math.BigDecimal precio,
            @RestForm("categoria") String categoria,
            @RestForm("tiendaId") String tiendaId,
            @RestForm("atributos") String atributosJson,
            @RestForm("activo") Boolean activo,
            @RestForm("stock_disponible") Integer stockDisponible,
            @RestForm("disponible") Boolean disponible,
            @RestForm("imagen") FileUpload imagen) {
        ProductoDTO dto = buildDto(nombre, descripcion, precio, categoria, tiendaId, atributosJson, activo, stockDisponible, disponible);
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
        if (imagen != null) {
            dto.imageBase64 = toImageDataUri(imagen);
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

    private ProductoDTO buildDto(
            String nombre,
            String descripcion,
            java.math.BigDecimal precio,
            String categoria,
            String tiendaId,
            String atributosJson,
            Boolean activo,
            Integer stockDisponible,
            Boolean disponible) {
        ProductoDTO dto = new ProductoDTO();
        dto.nombre = nombre;
        dto.descripcion = descripcion;
        dto.precio = precio;
        dto.categoria = categoria;
        dto.tiendaId = tiendaId;
        dto.activo = activo;
        dto.stockDisponible = stockDisponible;
        dto.disponible = disponible;
        dto.atributos = parseAtributos(atributosJson);
        return dto;
    }

    private Map<String, Object> parseAtributos(String atributosJson) {
        if (atributosJson == null || atributosJson.isBlank()) {
            return null;
        }

        try {
            return objectMapper.readValue(atributosJson, new TypeReference<Map<String, Object>>() {});
        } catch (IOException e) {
            throw new IllegalArgumentException("Los atributos del producto no son válidos");
        }
    }

    private String toImageDataUri(FileUpload fileUpload) {
        if (fileUpload == null) {
            return null;
        }

        String contentType = fileUpload.contentType();
        if (!"image/jpeg".equals(contentType) && !"image/png".equals(contentType)) {
            throw new IllegalArgumentException("La imagen debe ser JPG o PNG");
        }
        if (fileUpload.size() > MAX_IMAGE_SIZE) {
            throw new IllegalArgumentException("La imagen no puede superar 5MB");
        }

        try {
            byte[] bytes = Files.readAllBytes(fileUpload.filePath());
            return "data:" + contentType + ";base64," + Base64.getEncoder().encodeToString(bytes);
        } catch (IOException e) {
            throw new IllegalArgumentException("No se pudo procesar la imagen seleccionada");
        }
    }
}