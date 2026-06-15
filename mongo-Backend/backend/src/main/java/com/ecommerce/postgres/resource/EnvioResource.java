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

import java.net.URI;
import java.util.List;
import java.util.UUID;

@Path("/envios")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EnvioResource {

    @Inject
    EnvioService envioService;

    @GET
    public Response listAll() {
        List<EnvioResponse> response = envioService.listAll().stream().map(DtoMapper::toResponse).toList();
        return Response.ok(response).build();
    }

    @GET
    @Path("{id}")
    public Response findById(@PathParam("id") UUID id) {
        return Response.ok(DtoMapper.toResponse(envioService.findById(id))).build();
    }

    @GET
    @Path("pedido/{pedidoId}")
    public Response findByPedidoId(@PathParam("pedidoId") UUID pedidoId) {
        return Response.ok(envioService.findByPedidoId(pedidoId).stream().map(DtoMapper::toResponse).toList()).build();
    }

    @POST
    public Response create(@Valid EnvioRequest request) {
        var envio = envioService.create(DtoMapper.toEntity(request));
        return Response.created(URI.create("/envios/" + envio.getId())).entity(DtoMapper.toResponse(envio)).build();
    }

    @PUT
    @Path("{id}")
    public Response update(@PathParam("id") UUID id, @Valid EnvioRequest request) {
        return Response.ok(DtoMapper.toResponse(envioService.update(id, DtoMapper.toEntity(request)))).build();
    }

    @DELETE
    @Path("{id}")
    public Response delete(@PathParam("id") UUID id) {
        envioService.delete(id);
        return Response.noContent().build();
    }
}
