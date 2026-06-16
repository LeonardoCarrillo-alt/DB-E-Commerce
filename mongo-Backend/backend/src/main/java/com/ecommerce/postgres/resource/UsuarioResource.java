package com.ecommerce.postgres.resource;

import com.ecommerce.postgres.dto.request.UsuarioRequest;
import com.ecommerce.postgres.dto.response.UsuarioResponse;
import com.ecommerce.postgres.mapper.DtoMapper;
import com.ecommerce.postgres.service.UsuarioService;
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

@Path("/usuarios")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Usuarios", description = "Gestión de usuarios")
public class UsuarioResource {

    @Inject
    UsuarioService usuarioService;

    @Inject
    JsonWebToken jwt;

    @GET
    @Path("validar")
    @Operation(summary = "Validar credenciales", description = "Valida email y password, retorna datos del usuario para generar JWT.")
    @APIResponse(responseCode = "200", description = "Credenciales válidas")
    @APIResponse(responseCode = "401", description = "Credenciales inválidas")
    public Response validar(@QueryParam("email") String email,
                            @QueryParam("password") String password) {
        return Response.ok(DtoMapper.toResponse(usuarioService.validarCredenciales(email, password))).build();
    }

    @GET
    @Operation(summary = "Listar usuarios", description = "Obtiene todos los usuarios registrados.")
    @APIResponse(responseCode = "200", description = "Listado de usuarios", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = UsuarioResponse.class)))
    public Response listAll() {
        List<UsuarioResponse> response = usuarioService.listAll().stream().map(DtoMapper::toResponse).toList();
        return Response.ok(response).build();
    }

    @GET
    @Path("me")
    @Authenticated
    @Operation(summary = "Obtener usuario actual", description = "Recupera el usuario a partir del token JWT emitido por mongo-e-commerce.")
    @APIResponse(responseCode = "200", description = "Usuario encontrado", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = UsuarioResponse.class)))
    @APIResponse(responseCode = "401", description = "Token ausente o inválido")
    @APIResponse(responseCode = "404", description = "Usuario no encontrado")
    public Response getCurrentUser() {
        UUID userId = UUID.fromString(jwt.getSubject());
        return Response.ok(DtoMapper.toResponse(usuarioService.findById(userId))).build();
    }

    @GET
    @Path("{id}")
    @Operation(summary = "Obtener usuario", description = "Recupera un usuario por su identificador.")
    @APIResponse(responseCode = "200", description = "Usuario encontrado", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = UsuarioResponse.class)))
    @APIResponse(responseCode = "404", description = "Usuario no encontrado")
    public Response findById(@PathParam("id") UUID id) {
        return Response.ok(DtoMapper.toResponse(usuarioService.findById(id))).build();
    }

    @GET
    @Path("email/{email}")
    @Operation(summary = "Buscar usuario por email", description = "Recupera un usuario por su email.")
    @APIResponse(responseCode = "200", description = "Usuario encontrado", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = UsuarioResponse.class)))
    @APIResponse(responseCode = "404", description = "Usuario no encontrado")
    public Response findByEmail(@PathParam("email") String email) {
        return Response.ok(DtoMapper.toResponse(usuarioService.findByEmail(email))).build();
    }

    @POST
    @Operation(summary = "Crear usuario", description = "Crea un nuevo usuario.")
    @APIResponse(responseCode = "201", description = "Usuario creado", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = UsuarioResponse.class)))
    @APIResponse(responseCode = "400", description = "Datos inválidos")
    public Response create(@Valid UsuarioRequest request) {

    System.out.println("password_hash recibido = " + request.getPasswordHash());

    var usuario = usuarioService.create(DtoMapper.toEntity(request));

    return Response.created(URI.create("/usuarios/" + usuario.getId()))
            .entity(DtoMapper.toResponse(usuario))
            .build();
}
    // public Response create(@Valid @RequestBody(description = "Datos del usuario a crear", required = true, content = @Content(schema = @Schema(implementation = UsuarioRequest.class))) UsuarioRequest request) {
    //     var usuario = usuarioService.create(DtoMapper.toEntity(request));
    //     return Response.created(URI.create("/usuarios/" + usuario.getId())).entity(DtoMapper.toResponse(usuario)).build();
    // }

    @PUT
    @Path("{id}")
    @Operation(summary = "Actualizar usuario", description = "Actualiza un usuario existente.")
    @APIResponse(responseCode = "200", description = "Usuario actualizado", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = UsuarioResponse.class)))
    @APIResponse(responseCode = "400", description = "Datos inválidos")
    @APIResponse(responseCode = "404", description = "Usuario no encontrado")
    public Response update(@PathParam("id") UUID id, @Valid @RequestBody(description = "Datos actualizados del usuario", required = true, content = @Content(schema = @Schema(implementation = UsuarioRequest.class))) UsuarioRequest request) {
        return Response.ok(DtoMapper.toResponse(usuarioService.update(id, DtoMapper.toEntity(request)))).build();
    }

    @DELETE
    @Path("{id}")
    @Operation(summary = "Eliminar usuario", description = "Elimina un usuario por su identificador.")
    @APIResponse(responseCode = "204", description = "Usuario eliminado")
    @APIResponse(responseCode = "404", description = "Usuario no encontrado")
    public Response delete(@PathParam("id") UUID id) {
        usuarioService.delete(id);
        return Response.noContent().build();
    }
}
