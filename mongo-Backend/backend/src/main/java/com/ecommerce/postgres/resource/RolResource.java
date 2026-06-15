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

import java.net.URI;
import java.util.List;

@Path("/roles")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RolResource {

    @Inject
    RolService rolService;

    @GET
    public Response listAll() {
        List<RolResponse> response = rolService.listAll().stream().map(DtoMapper::toResponse).toList();
        return Response.ok(response).build();
    }

    @GET
    @Path("{id}")
    public Response findById(@PathParam("id") Long id) {
        return Response.ok(DtoMapper.toResponse(rolService.findById(id))).build();
    }

    @POST
    public Response create(@Valid RolRequest request) {
        var rol = rolService.create(DtoMapper.toEntity(request));
        return Response.created(URI.create("/roles/" + rol.getId())).entity(DtoMapper.toResponse(rol)).build();
    }

    @PUT
    @Path("{id}")
    public Response update(@PathParam("id") Long id, @Valid RolRequest request) {
        return Response.ok(DtoMapper.toResponse(rolService.update(id, DtoMapper.toEntity(request)))).build();
    }

    @DELETE
    @Path("{id}")
    public Response delete(@PathParam("id") Long id) {
        rolService.delete(id);
        return Response.noContent().build();
    }
}
