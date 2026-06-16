package bo.com.proj.client;

import bo.com.proj.dto.CrearPedidoRequestDTO;
import bo.com.proj.dto.PedidoResponseDTO;
import bo.com.proj.dto.PedidoUpdateStatusDTO;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import java.util.List;

@Path("/pedidos")
@RegisterRestClient(configKey = "pedidos-api")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface PedidoClient {

    @POST
    PedidoResponseDTO create(CrearPedidoRequestDTO request);

    @GET
    List<PedidoResponseDTO> listAll();

    @GET
    @Path("{id}")
    PedidoResponseDTO findById(@PathParam("id") String id);

    @GET
    @Path("usuario/{usuarioId}")
    List<PedidoResponseDTO> findByUsuarioId(@PathParam("usuarioId") String usuarioId);

    @PUT
    @Path("{id}")
    PedidoResponseDTO update(@PathParam("id") String id, CrearPedidoRequestDTO request);
}
