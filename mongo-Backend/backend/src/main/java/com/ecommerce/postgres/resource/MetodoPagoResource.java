package com.ecommerce.postgres.resource;

import com.ecommerce.postgres.dto.request.MetodoPagoRequest;
import com.ecommerce.postgres.dto.response.MetodoPagoResponse;
import com.ecommerce.postgres.mapper.DtoMapper;
import com.ecommerce.postgres.service.MetodoPagoService;
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

@Path("/metodos-pago")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Métodos de Pago", description = "Gestión de métodos de pago")
public class MetodoPagoResource {

    @Inject
    MetodoPagoService metodoPagoService;

    @GET
    @Operation(summary = "Listar métodos de pago", description = "Obtiene todos los métodos de pago registrados.")
    @APIResponse(responseCode = "200", description = "Listado de métodos de pago", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = MetodoPagoResponse.class)))
    public Response listAll() {
        List<MetodoPagoResponse> response = metodoPagoService.listAll().stream().map(DtoMapper::toResponse).toList();
        return Response.ok(response).build();
    }

    @GET
    @Path("{id}")
    @Operation(summary = "Obtener método de pago", description = "Recupera un método de pago por su identificador.")
    @APIResponse(responseCode = "200", description = "Método de pago encontrado", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = MetodoPagoResponse.class)))
    @APIResponse(responseCode = "404", description = "Método de pago no encontrado")
    public Response findById(@PathParam("id") UUID id) {
        return Response.ok(DtoMapper.toResponse(metodoPagoService.findById(id))).build();
    }

    @GET
    @Path("usuario/{usuarioId}")
    @Operation(summary = "Listar métodos de pago por usuario", description = "Obtiene los métodos de pago asociados a un usuario.")
    @APIResponse(responseCode = "200", description = "Listado de métodos de pago del usuario", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = MetodoPagoResponse.class)))
    public Response findByUsuarioId(@PathParam("usuarioId") UUID usuarioId) {
        return Response.ok(metodoPagoService.findByUsuarioId(usuarioId).stream().map(DtoMapper::toResponse).toList()).build();
    }

    @POST
    @Operation(summary = "Crear método de pago", description = "Crea un nuevo método de pago.")
    @APIResponse(responseCode = "201", description = "Método de pago creado", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = MetodoPagoResponse.class)))
    @APIResponse(responseCode = "400", description = "Datos inválidos")
    public Response create(@Valid @RequestBody(description = "Datos del método de pago a crear", required = true, content = @Content(schema = @Schema(implementation = MetodoPagoRequest.class))) MetodoPagoRequest request) {
        var metodo = metodoPagoService.create(DtoMapper.toEntity(request));
        return Response.created(URI.create("/metodos-pago/" + metodo.getId())).entity(DtoMapper.toResponse(metodo)).build();
    }

    @PUT
    @Path("{id}")
    @Operation(summary = "Actualizar método de pago", description = "Actualiza un método de pago existente.")
    @APIResponse(responseCode = "200", description = "Método de pago actualizado", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = MetodoPagoResponse.class)))
    @APIResponse(responseCode = "400", description = "Datos inválidos")
    @APIResponse(responseCode = "404", description = "Método de pago no encontrado")
    public Response update(@PathParam("id") UUID id, @Valid @RequestBody(description = "Datos actualizados del método de pago", required = true, content = @Content(schema = @Schema(implementation = MetodoPagoRequest.class))) MetodoPagoRequest request) {
        return Response.ok(DtoMapper.toResponse(metodoPagoService.update(id, DtoMapper.toEntity(request)))).build();
    }

    @DELETE
    @Path("{id}")
    @Operation(summary = "Eliminar método de pago", description = "Elimina un método de pago por su identificador.")
    @APIResponse(responseCode = "204", description = "Método de pago eliminado")
    @APIResponse(responseCode = "404", description = "Método de pago no encontrado")
    public Response delete(@PathParam("id") UUID id) {
        metodoPagoService.delete(id);
        return Response.noContent().build();
    }
}
