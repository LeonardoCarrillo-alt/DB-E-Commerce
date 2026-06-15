package com.ecommerce.postgres.resource;

import com.ecommerce.postgres.dto.request.RolRequest;
import com.ecommerce.postgres.dto.response.RolResponse;
import com.ecommerce.postgres.mapper.DtoMapper;
import com.ecommerce.postgres.service.RolService;
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

@Path("/roles")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Roles", description = "Gestión de roles")
public class RolResource {

    @Inject
    RolService rolService;

    @GET
    @Operation(summary = "Listar roles", description = "Obtiene todos los roles disponibles.")
    @APIResponse(responseCode = "200", description = "Listado de roles", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = RolResponse.class)))
    public Response listAll() {
        List<RolResponse> response = rolService.listAll().stream().map(DtoMapper::toResponse).toList();
        return Response.ok(response).build();
    }

    @GET
    @Path("{id}")
    @Operation(summary = "Obtener rol", description = "Recupera un rol por su identificador.")
    @APIResponse(responseCode = "200", description = "Rol encontrado", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = RolResponse.class)))
    @APIResponse(responseCode = "404", description = "Rol no encontrado")
    public Response findById(@PathParam("id") Long id) {
        return Response.ok(DtoMapper.toResponse(rolService.findById(id))).build();
    }

    @POST
    @Operation(summary = "Crear rol", description = "Crea un nuevo rol.")
    @APIResponse(responseCode = "201", description = "Rol creado", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = RolResponse.class)))
    @APIResponse(responseCode = "400", description = "Datos inválidos")
    public Response create(@Valid @RequestBody(description = "Datos del rol a crear", required = true, content = @Content(schema = @Schema(implementation = RolRequest.class))) RolRequest request) {
        var rol = rolService.create(DtoMapper.toEntity(request));
        return Response.created(URI.create("/roles/" + rol.getId())).entity(DtoMapper.toResponse(rol)).build();
    }

    @PUT
    @Path("{id}")
    @Operation(summary = "Actualizar rol", description = "Actualiza un rol existente.")
    @APIResponse(responseCode = "200", description = "Rol actualizado", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = RolResponse.class)))
    @APIResponse(responseCode = "400", description = "Datos inválidos")
    @APIResponse(responseCode = "404", description = "Rol no encontrado")
    public Response update(@PathParam("id") Long id, @Valid @RequestBody(description = "Datos actualizados del rol", required = true, content = @Content(schema = @Schema(implementation = RolRequest.class))) RolRequest request) {
        return Response.ok(DtoMapper.toResponse(rolService.update(id, DtoMapper.toEntity(request)))).build();
    }

    @DELETE
    @Path("{id}")
    @Operation(summary = "Eliminar rol", description = "Elimina un rol por su identificador.")
    @APIResponse(responseCode = "204", description = "Rol eliminado")
    @APIResponse(responseCode = "404", description = "Rol no encontrado")
    public Response delete(@PathParam("id") Long id) {
        rolService.delete(id);
        return Response.noContent().build();
    }
}
