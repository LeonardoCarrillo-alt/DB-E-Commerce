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

import java.net.URI;
import java.util.List;
import java.util.UUID;

@Path("/metodos-pago")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MetodoPagoResource {

    @Inject
    MetodoPagoService metodoPagoService;

    @GET
    public Response listAll() {
        List<MetodoPagoResponse> response = metodoPagoService.listAll().stream().map(DtoMapper::toResponse).toList();
        return Response.ok(response).build();
    }

    @GET
    @Path("{id}")
    public Response findById(@PathParam("id") UUID id) {
        return Response.ok(DtoMapper.toResponse(metodoPagoService.findById(id))).build();
    }

    @GET
    @Path("usuario/{usuarioId}")
    public Response findByUsuarioId(@PathParam("usuarioId") UUID usuarioId) {
        return Response.ok(metodoPagoService.findByUsuarioId(usuarioId).stream().map(DtoMapper::toResponse).toList()).build();
    }

    @POST
    public Response create(@Valid MetodoPagoRequest request) {
        var metodo = metodoPagoService.create(DtoMapper.toEntity(request));
        return Response.created(URI.create("/metodos-pago/" + metodo.getId())).entity(DtoMapper.toResponse(metodo)).build();
    }

    @PUT
    @Path("{id}")
    public Response update(@PathParam("id") UUID id, @Valid MetodoPagoRequest request) {
        return Response.ok(DtoMapper.toResponse(metodoPagoService.update(id, DtoMapper.toEntity(request)))).build();
    }

    @DELETE
    @Path("{id}")
    public Response delete(@PathParam("id") UUID id) {
        metodoPagoService.delete(id);
        return Response.noContent().build();
    }
}
