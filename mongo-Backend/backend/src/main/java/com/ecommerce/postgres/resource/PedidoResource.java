package com.ecommerce.postgres.resource;

import com.ecommerce.postgres.dto.request.PedidoRequest;
import com.ecommerce.postgres.dto.response.PedidoResponse;
import com.ecommerce.postgres.mapper.DtoMapper;
import com.ecommerce.postgres.service.PedidoService;
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

import java.net.URI;
import java.util.List;
import java.util.UUID;

@Path("/pedidos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Pedidos", description = "Gestión de pedidos")
public class PedidoResource {

    @Inject
    PedidoService pedidoService;

    @GET
    @Operation(summary = "Listar pedidos", description = "Obtiene todos los pedidos registrados.")
    @APIResponse(responseCode = "200", description = "Listado de pedidos", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = PedidoResponse.class)))
    public Response listAll() {
        List<PedidoResponse> response = pedidoService.listAll().stream().map(DtoMapper::toResponse).toList();
        return Response.ok(response).build();
    }

    @GET
    @Path("{id}")
    @Operation(summary = "Obtener pedido", description = "Recupera un pedido por su identificador.")
    @APIResponse(responseCode = "200", description = "Pedido encontrado", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = PedidoResponse.class)))
    @APIResponse(responseCode = "404", description = "Pedido no encontrado")
    public Response findById(@PathParam("id") UUID id) {
        return Response.ok(DtoMapper.toResponse(pedidoService.findById(id))).build();
    }

    @GET
    @Path("usuario/{usuarioId}")
    @Operation(summary = "Listar pedidos por usuario", description = "Obtiene los pedidos asociados a un usuario.")
    @APIResponse(responseCode = "200", description = "Listado de pedidos del usuario", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = PedidoResponse.class)))
    public Response findByUsuarioId(@PathParam("usuarioId") UUID usuarioId) {
        return Response.ok(pedidoService.findByUsuarioId(usuarioId).stream().map(DtoMapper::toResponse).toList()).build();
    }

    @POST
    @Operation(summary = "Crear pedido", description = "Crea un nuevo pedido.")
    @APIResponse(responseCode = "201", description = "Pedido creado", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = PedidoResponse.class)))
    @APIResponse(responseCode = "400", description = "Datos inválidos")
    public Response create(@Valid @RequestBody(description = "Datos del pedido a crear", required = true, content = @Content(schema = @Schema(implementation = PedidoRequest.class))) PedidoRequest request) {
        var pedido = pedidoService.create(DtoMapper.toEntity(request));
        return Response.created(URI.create("/pedidos/" + pedido.getId())).entity(DtoMapper.toResponse(pedido)).build();
    }

    @PUT
    @Path("{id}")
    @Operation(summary = "Actualizar pedido", description = "Actualiza un pedido existente.")
    @APIResponse(responseCode = "200", description = "Pedido actualizado", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = PedidoResponse.class)))
    @APIResponse(responseCode = "400", description = "Datos inválidos")
    @APIResponse(responseCode = "404", description = "Pedido no encontrado")
    public Response update(@PathParam("id") UUID id, @Valid @RequestBody(description = "Datos actualizados del pedido", required = true, content = @Content(schema = @Schema(implementation = PedidoRequest.class))) PedidoRequest request) {
        return Response.ok(DtoMapper.toResponse(pedidoService.update(id, DtoMapper.toEntity(request)))).build();
    }

    @DELETE
    @Path("{id}")
    @Operation(summary = "Eliminar pedido", description = "Elimina un pedido por su identificador.")
    @APIResponse(responseCode = "204", description = "Pedido eliminado")
    @APIResponse(responseCode = "404", description = "Pedido no encontrado")
    public Response delete(@PathParam("id") UUID id) {
        pedidoService.delete(id);
        return Response.noContent().build();
    }
}
