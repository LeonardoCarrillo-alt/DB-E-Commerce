package com.ecommerce.postgres.resource;

import com.ecommerce.postgres.dto.request.EnvioRequest;
import com.ecommerce.postgres.dto.response.EnvioResponse;
import com.ecommerce.postgres.mapper.DtoMapper;
import com.ecommerce.postgres.service.EnvioService;
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

@Path("/envios")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Envíos", description = "Gestión de envíos")
public class EnvioResource {

    @Inject
    EnvioService envioService;

    @GET
    @Operation(summary = "Listar envíos", description = "Obtiene todos los envíos registrados.")
    @APIResponse(responseCode = "200", description = "Listado de envíos", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = EnvioResponse.class)))
    public Response listAll() {
        List<EnvioResponse> response = envioService.listAll().stream().map(DtoMapper::toResponse).toList();
        return Response.ok(response).build();
    }

    @GET
    @Path("{id}")
    @Operation(summary = "Obtener envío", description = "Recupera un envío por su identificador.")
    @APIResponse(responseCode = "200", description = "Envío encontrado", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = EnvioResponse.class)))
    @APIResponse(responseCode = "404", description = "Envío no encontrado")
    public Response findById(@PathParam("id") UUID id) {
        return Response.ok(DtoMapper.toResponse(envioService.findById(id))).build();
    }

    @GET
    @Path("pedido/{pedidoId}")
    @Operation(summary = "Listar envíos por pedido", description = "Obtiene los envíos asociados a un pedido.")
    @APIResponse(responseCode = "200", description = "Listado de envíos del pedido", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = EnvioResponse.class)))
    public Response findByPedidoId(@PathParam("pedidoId") UUID pedidoId) {
        return Response.ok(envioService.findByPedidoId(pedidoId).stream().map(DtoMapper::toResponse).toList()).build();
    }

    @POST
    @Operation(summary = "Crear envío", description = "Crea un nuevo envío.")
    @APIResponse(responseCode = "201", description = "Envío creado", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = EnvioResponse.class)))
    @APIResponse(responseCode = "400", description = "Datos inválidos")
    public Response create(@Valid @RequestBody(description = "Datos del envío a crear", required = true, content = @Content(schema = @Schema(implementation = EnvioRequest.class))) EnvioRequest request) {
        var envio = envioService.create(DtoMapper.toEntity(request));
        return Response.created(URI.create("/envios/" + envio.getId())).entity(DtoMapper.toResponse(envio)).build();
    }

    @PUT
    @Path("{id}")
    @Operation(summary = "Actualizar envío", description = "Actualiza un envío existente.")
    @APIResponse(responseCode = "200", description = "Envío actualizado", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = EnvioResponse.class)))
    @APIResponse(responseCode = "400", description = "Datos inválidos")
    @APIResponse(responseCode = "404", description = "Envío no encontrado")
    public Response update(@PathParam("id") UUID id, @Valid @RequestBody(description = "Datos actualizados del envío", required = true, content = @Content(schema = @Schema(implementation = EnvioRequest.class))) EnvioRequest request) {
        return Response.ok(DtoMapper.toResponse(envioService.update(id, DtoMapper.toEntity(request)))).build();
    }

    @DELETE
    @Path("{id}")
    @Operation(summary = "Eliminar envío", description = "Elimina un envío por su identificador.")
    @APIResponse(responseCode = "204", description = "Envío eliminado")
    @APIResponse(responseCode = "404", description = "Envío no encontrado")
    public Response delete(@PathParam("id") UUID id) {
        envioService.delete(id);
        return Response.noContent().build();
    }
}
