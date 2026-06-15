package com.ecommerce.postgres.resource;

import com.ecommerce.postgres.dto.request.TiendaRequest;
import com.ecommerce.postgres.dto.response.TiendaResponse;
import com.ecommerce.postgres.mapper.DtoMapper;
import com.ecommerce.postgres.service.TiendaService;
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

@Path("/tiendas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Tiendas", description = "Gestión de tiendas")
public class TiendaResource {

    @Inject
    TiendaService tiendaService;

    @GET
    @Operation(summary = "Listar tiendas", description = "Obtiene todas las tiendas registradas.")
    @APIResponse(responseCode = "200", description = "Listado de tiendas", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = TiendaResponse.class)))
    public Response listAll() {
        List<TiendaResponse> response = tiendaService.listAll().stream().map(DtoMapper::toResponse).toList();
        return Response.ok(response).build();
    }

    @GET
    @Path("{id}")
    @Operation(summary = "Obtener tienda", description = "Recupera una tienda por su identificador.")
    @APIResponse(responseCode = "200", description = "Tienda encontrada", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = TiendaResponse.class)))
    @APIResponse(responseCode = "404", description = "Tienda no encontrada")
    public Response findById(@PathParam("id") UUID id) {
        return Response.ok(DtoMapper.toResponse(tiendaService.findById(id))).build();
    }

    @POST
    @Operation(summary = "Crear tienda", description = "Crea una nueva tienda.")
    @APIResponse(responseCode = "201", description = "Tienda creada", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = TiendaResponse.class)))
    @APIResponse(responseCode = "400", description = "Datos inválidos")
    public Response create(@Valid @RequestBody(description = "Datos de la tienda a crear", required = true, content = @Content(schema = @Schema(implementation = TiendaRequest.class))) TiendaRequest request) {
        var tienda = tiendaService.create(DtoMapper.toEntity(request));
        return Response.created(URI.create("/tiendas/" + tienda.getId())).entity(DtoMapper.toResponse(tienda)).build();
    }

    @PUT
    @Path("{id}")
    @Operation(summary = "Actualizar tienda", description = "Actualiza una tienda existente por su identificador.")
    @APIResponse(responseCode = "200", description = "Tienda actualizada", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = TiendaResponse.class)))
    @APIResponse(responseCode = "400", description = "Datos inválidos")
    @APIResponse(responseCode = "404", description = "Tienda no encontrada")
    public Response update(@PathParam("id") UUID id, @Valid @RequestBody(description = "Datos actualizados de la tienda", required = true, content = @Content(schema = @Schema(implementation = TiendaRequest.class))) TiendaRequest request) {
        return Response.ok(DtoMapper.toResponse(tiendaService.update(id, DtoMapper.toEntity(request)))).build();
    }

    @DELETE
    @Path("{id}")
    @Operation(summary = "Eliminar tienda", description = "Elimina una tienda por su identificador.")
    @APIResponse(responseCode = "204", description = "Tienda eliminada")
    @APIResponse(responseCode = "404", description = "Tienda no encontrada")
    public Response delete(@PathParam("id") UUID id) {
        tiendaService.delete(id);
        return Response.noContent().build();
    }
}
