package com.ecommerce.postgres.resource;

import com.ecommerce.postgres.dto.request.UsuarioRequest;
import com.ecommerce.postgres.dto.response.UsuarioResponse;
import com.ecommerce.postgres.mapper.DtoMapper;
import com.ecommerce.postgres.service.UsuarioService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@Path("/usuarios")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UsuarioResource {

    @Inject
    UsuarioService usuarioService;

    @GET
    public Response listAll() {
        List<UsuarioResponse> response = usuarioService.listAll().stream().map(DtoMapper::toResponse).toList();
        return Response.ok(response).build();
    }

    @GET
    @Path("{id}")
    public Response findById(@PathParam("id") UUID id) {
        return Response.ok(DtoMapper.toResponse(usuarioService.findById(id))).build();
    }

    @GET
    @Path("email/{email}")
    public Response findByEmail(@PathParam("email") String email) {
        return Response.ok(DtoMapper.toResponse(usuarioService.findByEmail(email))).build();
    }

    @POST
    public Response create(@Valid UsuarioRequest request) {
        var usuario = usuarioService.create(DtoMapper.toEntity(request));
        return Response.created(URI.create("/usuarios/" + usuario.getId())).entity(DtoMapper.toResponse(usuario)).build();
    }

    @PUT
    @Path("{id}")
    public Response update(@PathParam("id") UUID id, @Valid UsuarioRequest request) {
        return Response.ok(DtoMapper.toResponse(usuarioService.update(id, DtoMapper.toEntity(request)))).build();
    }

    @DELETE
    @Path("{id}")
    public Response delete(@PathParam("id") UUID id) {
        usuarioService.delete(id);
        return Response.noContent().build();
    }
}
