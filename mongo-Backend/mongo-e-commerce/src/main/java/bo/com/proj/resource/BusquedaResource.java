package bo.com.proj.resource;

import bo.com.proj.dto.BusquedaProductoDTO;
import bo.com.proj.dto.ProductoDTO;
import bo.com.proj.dto.ResultadoBusquedaDTO;
import bo.com.proj.dto.SugerenciaDTO;
import bo.com.proj.service.BusquedaService;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;

@Path("/busqueda")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Búsqueda", description = "Búsqueda avanzada de productos")
@PermitAll
public class BusquedaResource {
    
    @Inject
    BusquedaService busquedaService;
    
    @Context
    SecurityContext securityContext;
    
    // Búsqueda avanzada con filtros
    @POST
    @Path("/productos")
    @Operation(summary = "Búsqueda avanzada de productos con filtros y paginación")
    public Response buscar(BusquedaProductoDTO filtros) {
        String usuarioId = getCurrentUserId();
        ResultadoBusquedaDTO<ProductoDTO> resultados = busquedaService.buscar(filtros, usuarioId);
        return Response.ok(resultados).build();
    }
    
    // GET también soportado para búsquedas simples
    @GET
    @Path("/productos")
    @Operation(summary = "Búsqueda simple por query string")
    public Response buscarSimple(
            @QueryParam("q") String query,
            @QueryParam("categoria") String categoria,
            @QueryParam("precio_min") Double precioMin,
            @QueryParam("precio_max") Double precioMax,
            @QueryParam("pagina") @DefaultValue("1") Integer pagina,
            @QueryParam("limite") @DefaultValue("20") Integer limite,
            @QueryParam("ordenar") @DefaultValue("fechaCreacion") String ordenar,
            @QueryParam("dir") @DefaultValue("desc") String direccion) {
        
        BusquedaProductoDTO filtros = new BusquedaProductoDTO();
        filtros.query = query;
        filtros.categoria = categoria;
        filtros.precioMin = precioMin != null ? java.math.BigDecimal.valueOf(precioMin) : null;
        filtros.precioMax = precioMax != null ? java.math.BigDecimal.valueOf(precioMax) : null;
        filtros.pagina = pagina;
        filtros.limite = limite;
        filtros.ordenarPor = ordenar;
        filtros.ordenDireccion = direccion;
        
        String usuarioId = getCurrentUserId();
        ResultadoBusquedaDTO<ProductoDTO> resultados = busquedaService.buscar(filtros, usuarioId);
        return Response.ok(resultados).build();
    }
    
    // Autocompletado / sugerencias
    @GET
    @Path("/autocompletar")
    @Operation(summary = "Sugerencias de búsqueda en tiempo real")
    public Response autocompletar(@QueryParam("q") String termino) {
        if (termino == null || termino.length() < 2) {
            return Response.ok(List.of()).build();
        }
        String usuarioId = getCurrentUserId();
        List<SugerenciaDTO> sugerencias = busquedaService.autocompletar(termino, usuarioId);
        return Response.ok(sugerencias).build();
    }
    
    // Productos destacados (para homepage)
    @GET
    @Path("/destacados")
    @Operation(summary = "Productos destacados o más populares")
    public Response getDestacados(
            @QueryParam("categoria") String categoria,
            @QueryParam("limite") @DefaultValue("10") Integer limite) {
        List<ProductoDTO> productos = busquedaService.getProductosDestacados(categoria, limite);
        return Response.ok(productos).build();
    }
    
    // Productos relacionados
    @GET
    @Path("/relacionados/{productoId}")
    @Operation(summary = "Productos relacionados por categoría y atributos")
    public Response getRelacionados(
            @PathParam("productoId") String productoId,
            @QueryParam("categoria") String categoria,
            @QueryParam("atributos") String atributosJson, // Opcional: pasar JSON
            @QueryParam("limite") @DefaultValue("6") Integer limite) {
        
        // Por simplicidad, si no se pasan atributos, usamos null
        List<ProductoDTO> productos = busquedaService.getProductosRelacionados(
            productoId, categoria, null, limite
        );
        return Response.ok(productos).build();
    }
    
    private String getCurrentUserId() {
        if (securityContext.getUserPrincipal() != null) {
            return securityContext.getUserPrincipal().getName();
        }
        return null;
    }
}