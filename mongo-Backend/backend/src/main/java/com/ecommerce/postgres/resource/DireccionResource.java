package com.ecommerce.postgres.resource;

import com.ecommerce.postgres.dto.request.DireccionRequest;
import com.ecommerce.postgres.dto.response.DireccionResponse;
import com.ecommerce.postgres.mapper.DtoMapper;
import com.ecommerce.postgres.service.DireccionService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.RequestBody;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@Path("/direcciones")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Direcciones", description = "Gestión de direcciones")
public class DireccionResource {

    @Inject
    DireccionService direccionService;

    @Inject
    JsonWebToken jwt;

    @GET
    @Operation(summary = "Listar direcciones", description = "Obtiene todas las direcciones registradas.")
    @APIResponse(responseCode = "200", description = "Listado de direcciones", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = DireccionResponse.class)))
    public Response listAll() {
        List<DireccionResponse> response = direccionService.listAll().stream().map(DtoMapper::toResponse).toList();
        return Response.ok(response).build();
    }

    @GET
    @Path("{id}")
    @Authenticated
    @Operation(summary = "Obtener dirección", description = "Recupera una dirección por su identificador.")
    @APIResponse(responseCode = "200", description = "Dirección encontrada", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = DireccionResponse.class)))
    @APIResponse(responseCode = "404", description = "Dirección no encontrada")
    public Response findById(@PathParam("id") UUID id) {
        return Response.ok(DtoMapper.toResponse(direccionService.findById(id))).build();
    }

    @GET
    @Path("usuario/{usuarioId}")
    @Authenticated
    @Operation(summary = "Listar direcciones por usuario", description = "Obtiene las direcciones asociadas a un usuario.")
    @APIResponse(responseCode = "200", description = "Listado de direcciones del usuario", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = DireccionResponse.class)))
    @APIResponse(responseCode = "403", description = "No autorizado para ver direcciones de otro usuario")
    public Response findByUsuarioId(@PathParam("usuarioId") UUID usuarioId) {
        UUID currentUserId = UUID.fromString(jwt.getSubject());
        if (!currentUserId.equals(usuarioId)) {
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        return Response.ok(direccionService.findByUsuarioId(usuarioId).stream().map(DtoMapper::toResponse).toList()).build();
    }

    @POST
    @Authenticated
    @Operation(summary = "Crear dirección", description = "Crea una nueva dirección para el usuario autenticado.")
    @APIResponse(responseCode = "201", description = "Dirección creada", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = DireccionResponse.class)))
    @APIResponse(responseCode = "400", description = "Datos inválidos")
    public Response create(@Valid @RequestBody(description = "Datos de la dirección a crear", required = true, content = @Content(schema = @Schema(implementation = DireccionRequest.class))) DireccionRequest request) {
        UUID currentUserId = UUID.fromString(jwt.getSubject());
        request.setUsuarioId(currentUserId);
        var direccion = direccionService.create(DtoMapper.toEntity(request));
        return Response.created(URI.create("/direcciones/" + direccion.getId())).entity(DtoMapper.toResponse(direccion)).build();
    }

    @PUT
    @Path("{id}")
    @Authenticated
    @Operation(summary = "Actualizar dirección", description = "Actualiza una dirección existente del usuario autenticado.")
    @APIResponse(responseCode = "200", description = "Dirección actualizada", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = DireccionResponse.class)))
    @APIResponse(responseCode = "400", description = "Datos inválidos")
    @APIResponse(responseCode = "403", description = "No autorizado para modificar esta dirección")
    @APIResponse(responseCode = "404", description = "Dirección no encontrada")
    public Response update(@PathParam("id") UUID id, @Valid @RequestBody(description = "Datos actualizados de la dirección", required = true, content = @Content(schema = @Schema(implementation = DireccionRequest.class))) DireccionRequest request) {
        UUID currentUserId = UUID.fromString(jwt.getSubject());
        var existing = direccionService.findById(id);
        if (!existing.getUsuario().getId().equals(currentUserId)) {
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        request.setUsuarioId(currentUserId);
        return Response.ok(DtoMapper.toResponse(direccionService.update(id, DtoMapper.toEntity(request)))).build();
    }

    @DELETE
    @Path("{id}")
    @Authenticated
    @Operation(summary = "Eliminar dirección", description = "Elimina una dirección por su identificador.")
    @APIResponse(responseCode = "204", description = "Dirección eliminada")
    @APIResponse(responseCode = "403", description = "No autorizado para eliminar esta dirección")
    @APIResponse(responseCode = "404", description = "Dirección no encontrada")
    public Response delete(@PathParam("id") UUID id) {
        UUID currentUserId = UUID.fromString(jwt.getSubject());
        var existing = direccionService.findById(id);
        if (!existing.getUsuario().getId().equals(currentUserId)) {
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        direccionService.delete(id);
        return Response.noContent().build();
    }
}
