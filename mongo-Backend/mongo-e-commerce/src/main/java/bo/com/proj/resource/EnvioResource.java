package bo.com.proj.resource;

import bo.com.proj.client.EnvioClient;
import bo.com.proj.dto.EnvioRequestDTO;
import bo.com.proj.dto.EnvioResponseDTO;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import java.util.List;

@Path("/envios")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Envíos", description = "Gestión de envíos (proxy a PostgreSQL)")
public class EnvioResource {

    @Inject
    @RestClient
    EnvioClient envioClient;

    @GET
    @RolesAllowed({"SUPER_ADMIN", "ADMIN_TIENDA"})
    @Operation(summary = "Listar todos los envíos")
    public Response listAll() {
        List<EnvioResponseDTO> envios = envioClient.listAll();
        return Response.ok(envios).build();
    }

    @GET
    @Path("{id}")
    @RolesAllowed({"SUPER_ADMIN", "ADMIN_TIENDA"})
    @Operation(summary = "Obtener envío por ID")
    public Response findById(@PathParam("id") String id) {
        EnvioResponseDTO envio = envioClient.findById(id);
        return Response.ok(envio).build();
    }

    @GET
    @Path("pedido/{pedidoId}")
    @RolesAllowed({"SUPER_ADMIN", "ADMIN_TIENDA"})
    @Operation(summary = "Obtener envío por pedido")
    public Response findByPedidoId(@PathParam("pedidoId") String pedidoId) {
        List<EnvioResponseDTO> envios = envioClient.findByPedidoId(pedidoId);
        return Response.ok(envios).build();
    }

    @POST
    @RolesAllowed({"SUPER_ADMIN", "ADMIN_TIENDA"})
    @Operation(summary = "Crear envío")
    public Response create(EnvioRequestDTO request) {
        EnvioResponseDTO envio = envioClient.create(request);
        return Response.ok(envio).build();
    }

    @PUT
    @Path("{id}")
    @RolesAllowed({"SUPER_ADMIN", "ADMIN_TIENDA"})
    @Operation(summary = "Actualizar envío")
    public Response update(@PathParam("id") String id, EnvioRequestDTO request) {
        EnvioResponseDTO envio = envioClient.update(id, request);
        return Response.ok(envio).build();
    }

    @DELETE
    @Path("{id}")
    @RolesAllowed({"SUPER_ADMIN", "ADMIN_TIENDA"})
    @Operation(summary = "Eliminar envío")
    public Response delete(@PathParam("id") String id) {
        envioClient.delete(id);
        return Response.noContent().build();
    }
}
