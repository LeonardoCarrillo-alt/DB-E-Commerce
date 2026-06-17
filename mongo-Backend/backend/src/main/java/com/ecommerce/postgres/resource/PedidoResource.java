package com.ecommerce.postgres.resource;

import com.ecommerce.postgres.dto.request.PedidoRequest;
import com.ecommerce.postgres.dto.response.PedidoResponse;
import com.ecommerce.postgres.mapper.DtoMapper;
import com.ecommerce.postgres.service.PedidoService;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.RequestBody;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger; // 📥 Importamos el Logger de JBoss estándar en Quarkus

import java.net.URI;
import java.util.List;
import java.util.UUID;

@Path("/pedidos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Pedidos", description = "Gestión de pedidos")
public class PedidoResource {

    // 🔍 Inicializamos el Logger para esta clase
    private static final Logger LOGGER = Logger.getLogger(PedidoResource.class);

    @Inject
    PedidoService pedidoService;

    @GET
    @Operation(summary = "Listar pedidos", description = "Obtiene todos los pedidos registrados.")
    @APIResponse(responseCode = "200", description = "Listado de pedidos", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = PedidoResponse.class)))
    public Response listAll() {
        LOGGER.info("📥 GET /pedidos - Solicitando listado de todos los pedidos");
        
        List<PedidoResponse> response = pedidoService.listAll().stream()
                .map(DtoMapper::toResponse)
                .toList();
        
        LOGGER.infof("✅ GET /pedidos - Listado obtenido exitosamente. Cantidad de elementos: [%d]", response.size());
        return Response.ok(response).build();
    }

    @GET
    @Path("{id}")
    @Operation(summary = "Obtener pedido", description = "Recupera un pedido por su identificador.")
    @APIResponse(responseCode = "200", description = "Pedido encontrado", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = PedidoResponse.class)))
    @APIResponse(responseCode = "404", description = "Pedido no encontrado")
    public Response findById(@PathParam("id") UUID id) {
        LOGGER.infof("📥 GET /pedidos/%s - Buscando pedido por ID", id);
        
        var pedido = pedidoService.findById(id);
        var response = DtoMapper.toResponse(pedido);
        
        LOGGER.infof("✅ GET /pedidos/%s - Pedido recuperado. Estado actual: [%s]", id, response.getEstado()); // (Asumiendo que response tiene getEstado())
        return Response.ok(response).build();
    }

    @GET
    @Path("usuario/{usuarioId}")
    @Operation(summary = "Listar pedidos por usuario", description = "Obtiene los pedidos asociados a un usuario.")
    @APIResponse(responseCode = "200", description = "Listado de pedidos del usuario", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = PedidoResponse.class)))
    public Response findByUsuarioId(@PathParam("usuarioId") UUID usuarioId) {
        LOGGER.infof("📥 GET /pedidos/usuario/%s - Buscando pedidos del usuario", usuarioId);
        
        List<PedidoResponse> response = pedidoService.findByUsuarioId(usuarioId).stream()
                .map(DtoMapper::toResponse)
                .toList();
        
        LOGGER.infof("✅ GET /pedidos/usuario/%s - Pedidos encontrados: [%d]", usuarioId, response.size());
        return Response.ok(response).build();
    }

    @POST
    @PermitAll
    @Operation(summary = "Crear pedido", description = "Crea un nuevo pedido.")
    @APIResponse(responseCode = "201", description = "Pedido creado", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = PedidoResponse.class)))
    @APIResponse(responseCode = "400", description = "Datos inválidos")
    public Response create(@Valid @RequestBody(description = "Datos del pedido a crear", required = true, content = @Content(schema = @Schema(implementation = PedidoRequest.class))) PedidoRequest request) {
        // Logeamos datos clave que vienen en el body (ej. usuarioId, total, reservaId si lo tuviera)
        LOGGER.infof("📥 POST /pedidos - Intentando crear pedido para el usuarioId: [%s]", request.getUsuarioId()); // (Cambia getUsuarioId() si se llama distinto)
        
        var pedidoEntity = DtoMapper.toEntity(request);
        var pedidoCreado = pedidoService.create(pedidoEntity);
        var response = DtoMapper.toResponse(pedidoCreado);
        
        LOGGER.infof("✅ POST /pedidos - Pedido creado exitosamente en Postgres con ID: [%s]", pedidoCreado.getId());
        return Response.created(URI.create("/pedidos/" + pedidoCreado.getId())).entity(response).build();
    }

    @PUT
    @Path("{id}")
    @Operation(summary = "Actualizar pedido", description = "Actualiza un pedido existente.")
    @APIResponse(responseCode = "200", description = "Pedido actualizado", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = PedidoResponse.class)))
    @APIResponse(responseCode = "400", description = "Datos inválidos")
    @APIResponse(responseCode = "404", description = "Pedido no encontrado")
    public Response update(@PathParam("id") UUID id, @Valid @RequestBody(description = "Datos actualizados del pedido", required = true, content = @Content(schema = @Schema(implementation = PedidoRequest.class))) PedidoRequest request) {
        LOGGER.infof("📥 PUT /pedidos/%s - Solicitud de actualización recibida", id);
        
        var pedidoActualizado = pedidoService.update(id, DtoMapper.toEntity(request));
        var response = DtoMapper.toResponse(pedidoActualizado);
        
        LOGGER.infof("✅ PUT /pedidos/%s - Pedido modificado correctamente", id);
        return Response.ok(response).build();
    }

    @DELETE
    @Path("{id}")
    @Operation(summary = "Eliminar pedido", description = "Elimina un pedido por su identificador.")
    @APIResponse(responseCode = "204", description = "Pedido eliminado")
    @APIResponse(responseCode = "404", description = "Pedido no encontrado")
    public Response delete(@PathParam("id") UUID id) {
        LOGGER.warnf("⚠️ DELETE /pedidos/%s - Solicitud de ELIMINACIÓN recibida", id);
        
        pedidoService.delete(id);
        
        LOGGER.infof("✅ DELETE /pedidos/%s - Pedido eliminado exitosamente", id);
        return Response.noContent().build();
    }
}