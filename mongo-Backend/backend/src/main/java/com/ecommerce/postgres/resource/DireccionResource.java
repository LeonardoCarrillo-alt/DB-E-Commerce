package com.ecommerce.postgres.resource;

import com.ecommerce.postgres.dto.request.DireccionRequest;
import com.ecommerce.postgres.dto.response.DireccionResponse;
import com.ecommerce.postgres.mapper.DtoMapper;
import com.ecommerce.postgres.service.DireccionService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@Path("/direcciones")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DireccionResource {

    @Inject
    DireccionService direccionService;

    @GET
    public Response listAll() {
        List<DireccionResponse> response = direccionService.listAll().stream().map(DtoMapper::toResponse).toList();
        return Response.ok(response).build();
    }

    @GET
    @Path("{id}")
    public Response findById(@PathParam("id") UUID id) {
        return Response.ok(DtoMapper.toResponse(direccionService.findById(id))).build();
    }

    @GET
    @Path("usuario/{usuarioId}")
    public Response findByUsuarioId(@PathParam("usuarioId") UUID usuarioId) {
        return Response.ok(direccionService.findByUsuarioId(usuarioId).stream().map(DtoMapper::toResponse).toList()).build();
    }

    @POST
    public Response create(@Valid DireccionRequest request) {
        var direccion = direccionService.create(DtoMapper.toEntity(request));
        return Response.created(URI.create("/direcciones/" + direccion.getId())).entity(DtoMapper.toResponse(direccion)).build();
    }

    @PUT
    @Path("{id}")
    public Response update(@PathParam("id") UUID id, @Valid DireccionRequest request) {
        return Response.ok(DtoMapper.toResponse(direccionService.update(id, DtoMapper.toEntity(request)))).build();
    }

    @DELETE
    @Path("{id}")
    public Response delete(@PathParam("id") UUID id) {
        direccionService.delete(id);
        return Response.noContent().build();
    }
}
