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

import java.net.URI;
import java.util.List;
import java.util.UUID;

@Path("/pedidos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PedidoResource {

    @Inject
    PedidoService pedidoService;

    @GET
    public Response listAll() {
        List<PedidoResponse> response = pedidoService.listAll().stream().map(DtoMapper::toResponse).toList();
        return Response.ok(response).build();
    }

    @GET
    @Path("{id}")
    public Response findById(@PathParam("id") UUID id) {
        return Response.ok(DtoMapper.toResponse(pedidoService.findById(id))).build();
    }

    @GET
    @Path("usuario/{usuarioId}")
    public Response findByUsuarioId(@PathParam("usuarioId") UUID usuarioId) {
        return Response.ok(pedidoService.findByUsuarioId(usuarioId).stream().map(DtoMapper::toResponse).toList()).build();
    }

    @POST
    public Response create(@Valid PedidoRequest request) {
        var pedido = pedidoService.create(DtoMapper.toEntity(request));
        return Response.created(URI.create("/pedidos/" + pedido.getId())).entity(DtoMapper.toResponse(pedido)).build();
    }

    @PUT
    @Path("{id}")
    public Response update(@PathParam("id") UUID id, @Valid PedidoRequest request) {
        return Response.ok(DtoMapper.toResponse(pedidoService.update(id, DtoMapper.toEntity(request)))).build();
    }

    @DELETE
    @Path("{id}")
    public Response delete(@PathParam("id") UUID id) {
        pedidoService.delete(id);
        return Response.noContent().build();
    }
}
