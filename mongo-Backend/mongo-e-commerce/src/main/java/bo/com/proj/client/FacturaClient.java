package bo.com.proj.client;

import bo.com.proj.dto.FacturaRequestDTO;
import bo.com.proj.dto.FacturaResponseDTO;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import java.util.List;

@Path("/facturas")
@RegisterRestClient(configKey = "facturas-api")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface FacturaClient {

    @GET
    List<FacturaResponseDTO> listAll();

    @GET
    @Path("{id}")
    FacturaResponseDTO findById(@PathParam("id") String id);

    @GET
    @Path("pedido/{pedidoId}")
    List<FacturaResponseDTO> findByPedidoId(@PathParam("pedidoId") String pedidoId);

    @POST
    FacturaResponseDTO create(FacturaRequestDTO request);

    @PUT
    @Path("{id}")
    FacturaResponseDTO update(@PathParam("id") String id, FacturaRequestDTO request);

    @DELETE
    @Path("{id}")
    void delete(@PathParam("id") String id);
}
