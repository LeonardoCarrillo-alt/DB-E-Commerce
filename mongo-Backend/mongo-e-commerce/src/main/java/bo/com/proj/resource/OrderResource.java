package bo.com.proj.resource;

import bo.com.proj.client.PedidoClient;
import bo.com.proj.dto.*;
import bo.com.proj.service.CarritoService;
import bo.com.proj.service.InventarioService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import java.math.BigDecimal;
import java.util.Map;
import java.util.stream.Collectors;

@Path("/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Órdenes", description = "Creación de pedidos desde el checkout")
public class OrderResource {

    @Inject
    CarritoService carritoService;

    @Inject
    InventarioService inventarioService;

    @Inject
    @RestClient
    PedidoClient pedidoClient;

    @Context
    SecurityContext securityContext;

    @POST
    @RolesAllowed({"CLIENTE", "ADMIN_TIENDA", "SUPER_ADMIN"})
    @Operation(summary = "Crear pedido desde el checkout")
    public Response create(@Valid CreateOrderRequestDTO request) {
        String usuarioId = securityContext.getUserPrincipal().getName();

        // 1. Obtener carrito para conocer el total
        CarritoDTO carrito = carritoService.getCarritoByUsuario(usuarioId, false);

        // 2. Crear pedido en PostgreSQL
        CrearPedidoRequestDTO pedidoReq = new CrearPedidoRequestDTO();
        pedidoReq.usuarioId = usuarioId;
        pedidoReq.total = carrito.total != null ? carrito.total : BigDecimal.ZERO;
        pedidoReq.estado = "PENDIENTE";

        PedidoResponseDTO pedido;
        try {
            pedido = pedidoClient.create(pedidoReq);
        } catch (WebApplicationException e) {
            String body = e.getResponse().readEntity(String.class);
            throw new RuntimeException("Error al crear el pedido en PostgreSQL (status " + e.getResponse().getStatus() + "): " + body);
        } catch (Exception e) {
            throw new RuntimeException("Error al crear el pedido en PostgreSQL: " + e.getMessage());
        }

        // 3. Confirmar la reserva de stock
        ConfirmarCompraDTO confirmarDTO = new ConfirmarCompraDTO();
        confirmarDTO.reservaId = request.reservaId;
        confirmarDTO.orderId = pedido.id;

        try {
            inventarioService.confirmarCompra(confirmarDTO);
        } catch (Exception e) {
            throw new RuntimeException("Error al confirmar la reserva de stock: " + e.getMessage());
        }

        return Response.ok(Map.of(
            "id", pedido.id,
            "total", pedido.total,
            "estado", pedido.estado,
            "message", "Pedido creado exitosamente"
        )).build();
    }
}
