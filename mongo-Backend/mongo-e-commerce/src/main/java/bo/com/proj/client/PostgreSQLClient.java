package bo.com.proj.client;

import bo.com.proj.dto.UsuarioResponseDTO;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@Path("/api")
@RegisterRestClient(configKey = "postgresql-api")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface PostgreSQLClient {
    
    @GET
    @Path("/usuarios/validar")
    UsuarioResponseDTO validarCredenciales(
        @QueryParam("email") String email,
        @QueryParam("password") String password
    );
    
    @GET
    @Path("/usuarios/{id}")
    UsuarioResponseDTO getUsuarioById(@PathParam("id") String id);
    
    @GET
    @Path("/usuarios/me")
    UsuarioResponseDTO getCurrentUser(@HeaderParam("Authorization") String token);
}