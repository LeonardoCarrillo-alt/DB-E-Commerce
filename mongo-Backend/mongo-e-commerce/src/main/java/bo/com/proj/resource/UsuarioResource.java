package bo.com.proj.resource;

import bo.com.proj.client.PostgreSQLClient;
import bo.com.proj.dto.UsuarioResponseDTO;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import java.util.List;

@Path("/usuarios")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Usuarios", description = "Gestión de usuarios (proxy a PostgreSQL)")
public class UsuarioResource {

    @Inject
    @RestClient
    PostgreSQLClient postgresClient;

    @GET
    @RolesAllowed({"SUPER_ADMIN", "ADMIN_TIENDA"})
    @Operation(summary = "Listar todos los usuarios")
    public Response listAll() {
        List<UsuarioResponseDTO> usuarios = postgresClient.listAll();
        return Response.ok(usuarios).build();
    }
}
