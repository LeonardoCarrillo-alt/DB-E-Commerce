package bo.com.proj.client;

import bo.com.proj.dto.CrearPedidoRequestDTO;
import bo.com.proj.dto.PedidoResponseDTO;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@Path("/pedidos")
@RegisterRestClient(configKey = "pedidos-api")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface PedidoClient {

    @POST
    PedidoResponseDTO create(CrearPedidoRequestDTO request);
}
