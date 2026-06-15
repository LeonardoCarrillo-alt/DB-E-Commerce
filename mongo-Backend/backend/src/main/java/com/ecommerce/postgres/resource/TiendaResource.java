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

import java.net.URI;
import java.util.List;
import java.util.UUID;

@Path("/tiendas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TiendaResource {

    @Inject
    TiendaService tiendaService;

    @GET
    public Response listAll() {
        List<TiendaResponse> response = tiendaService.listAll().stream().map(DtoMapper::toResponse).toList();
        return Response.ok(response).build();
    }

    @GET
    @Path("{id}")
    public Response findById(@PathParam("id") UUID id) {
        return Response.ok(DtoMapper.toResponse(tiendaService.findById(id))).build();
    }

    @POST
    public Response create(@Valid TiendaRequest request) {
        var tienda = tiendaService.create(DtoMapper.toEntity(request));
        return Response.created(URI.create("/tiendas/" + tienda.getId())).entity(DtoMapper.toResponse(tienda)).build();
    }

    @PUT
    @Path("{id}")
    public Response update(@PathParam("id") UUID id, @Valid TiendaRequest request) {
        return Response.ok(DtoMapper.toResponse(tiendaService.update(id, DtoMapper.toEntity(request)))).build();
    }

    @DELETE
    @Path("{id}")
    public Response delete(@PathParam("id") UUID id) {
        tiendaService.delete(id);
        return Response.noContent().build();
    }
}
