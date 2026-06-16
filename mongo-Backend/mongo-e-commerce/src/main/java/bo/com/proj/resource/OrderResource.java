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
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Path("/pedidos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Órdenes", description = "Gestión de pedidos")
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

        CarritoDTO carrito = carritoService.getCarritoByUsuario(usuarioId, false);

        CrearPedidoRequestDTO pedidoReq = new CrearPedidoRequestDTO();
        pedidoReq.usuarioId = usuarioId;
        pedidoReq.total = carrito.total != null ? carrito.total : BigDecimal.ZERO;
        pedidoReq.estado = "PENDIENTE";
        pedidoReq.items = carrito.items.stream().map(item -> {
            CrearPedidoRequestDTO.ItemPedidoDTO dto = new CrearPedidoRequestDTO.ItemPedidoDTO();
            dto.productoId = item.productoId;
            dto.cantidad = item.cantidad;
            dto.precioUnitario = item.precioUnitario;
            return dto;
        }).collect(Collectors.toList());

        PedidoResponseDTO pedido;
        try {
            pedido = pedidoClient.create(pedidoReq);
        } catch (WebApplicationException e) {
            String body = e.getResponse().readEntity(String.class);
            throw new RuntimeException("Error al crear el pedido en PostgreSQL (status " + e.getResponse().getStatus() + "): " + body);
        } catch (Exception e) {
            throw new RuntimeException("Error al crear el pedido en PostgreSQL: " + e.getMessage());
        }

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

    @GET
    @RolesAllowed({"SUPER_ADMIN", "ADMIN_TIENDA"})
    @Operation(summary = "Listar todos los pedidos")
    public Response listAll() {
        List<PedidoResponseDTO> pedidos = pedidoClient.listAll();
        return Response.ok(pedidos).build();
    }

    @GET
    @Path("{id}")
    @RolesAllowed({"CLIENTE", "ADMIN_TIENDA", "SUPER_ADMIN"})
    @Operation(summary = "Obtener pedido por ID")
    public Response findById(@PathParam("id") String id) {
        PedidoResponseDTO pedido = pedidoClient.findById(id);
        return Response.ok(pedido).build();
    }

    @GET
    @Path("usuario/me")
    @RolesAllowed({"CLIENTE", "ADMIN_TIENDA", "SUPER_ADMIN"})
    @Operation(summary = "Listar pedidos del usuario autenticado")
    public Response findMyOrders() {
        String usuarioId = securityContext.getUserPrincipal().getName();
        List<PedidoResponseDTO> pedidos = pedidoClient.findByUsuarioId(usuarioId);
        return Response.ok(pedidos).build();
    }

    @PUT
    @Path("{id}/estado")
    @RolesAllowed({"SUPER_ADMIN", "ADMIN_TIENDA"})
    @Operation(summary = "Actualizar estado de un pedido")
    public Response updateStatus(@PathParam("id") String id, PedidoUpdateStatusDTO dto) {
        PedidoResponseDTO current = pedidoClient.findById(id);
        CrearPedidoRequestDTO updateReq = new CrearPedidoRequestDTO();
        updateReq.usuarioId = current.usuarioId;
        updateReq.total = current.total;
        updateReq.estado = dto.estado;
        PedidoResponseDTO updated = pedidoClient.update(id, updateReq);
        return Response.ok(updated).build();
    }
}
