package bo.com.proj.client;

import bo.com.proj.dto.EnvioRequestDTO;
import bo.com.proj.dto.EnvioResponseDTO;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import java.util.List;

@Path("/envios")
@RegisterRestClient(configKey = "envios-api")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface EnvioClient {

    @GET
    List<EnvioResponseDTO> listAll();

    @GET
    @Path("{id}")
    EnvioResponseDTO findById(@PathParam("id") String id);

    @GET
    @Path("pedido/{pedidoId}")
    List<EnvioResponseDTO> findByPedidoId(@PathParam("pedidoId") String pedidoId);

    @POST
    EnvioResponseDTO create(EnvioRequestDTO request);

    @PUT
    @Path("{id}")
    EnvioResponseDTO update(@PathParam("id") String id, EnvioRequestDTO request);

    @DELETE
    @Path("{id}")
    void delete(@PathParam("id") String id);
}
