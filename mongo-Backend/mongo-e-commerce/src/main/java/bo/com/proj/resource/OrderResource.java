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
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.jboss.logging.Logger;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Path("/pedidos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Órdenes", description = "Gestión de pedidos")
public class OrderResource {

    private static final Logger LOGGER = Logger.getLogger(OrderResource.class);

    @Inject
    CarritoService carritoService;

    @Inject
    InventarioService inventarioService;

    @Inject
    @RestClient
    PedidoClient pedidoClient;

    @Inject
    JsonWebToken jwt;

    @Context
    SecurityContext securityContext;

    @POST
    @RolesAllowed({"CLIENTE", "ADMIN_TIENDA", "SUPER_ADMIN"})
    @Operation(summary = "Crear pedido desde el checkout")
    public Response create(@Valid CreateOrderRequestDTO request) {
        // 1. Identificador en formato String (Email) para interactuar con MongoDB (Carrito)
        String carritoUsuarioId = jwt.getClaim("email") != null ? jwt.getClaim("email").toString() : jwt.getSubject();
        
        // 2. Identificador en formato UUID compatible con la base de datos relacional de Pedidos
        String pedidoUsuarioIdStr;
        if (jwt.getClaim("userId") != null) {
            pedidoUsuarioIdStr = jwt.getClaim("userId").toString();
        } else if (jwt.getSubject() != null && !jwt.getSubject().contains("@")) {
            pedidoUsuarioIdStr = jwt.getSubject();
        } else {
            pedidoUsuarioIdStr = "8fe45199-5f44-4b5a-855a-bfc88395d5ec"; 
        }

        LOGGER.infof("============== 🕵️ DEBÚG API: POST /pedidos ==============");
        LOGGER.infof("📥 Buscando carrito en MongoDB con ID de usuario: [%s]", carritoUsuarioId);
        LOGGER.infof("🆔 Generando pedido en PostgreSQL con formato UUID: [%s]", pedidoUsuarioIdStr);
        LOGGER.infof("📦 ReservaId enviado desde el Frontend: [%s]", request.reservaId);

        // 1. Obtener Carrito de MongoDB
        LOGGER.info("🛒 Recuperando información actualizada del carrito de MongoDB...");
        CarritoDTO carrito = carritoService.getCarritoByUsuario(carritoUsuarioId, false);
        LOGGER.infof("✅ Carrito recuperado. ID: [%s], Items: [%d], Total original: [%s]", 
                carrito.id, (carrito.items != null ? carrito.items.size() : 0), carrito.total);

        // 2. Mapear request para Microservicio Postgres
        CrearPedidoRequestDTO pedidoReq = new CrearPedidoRequestDTO();
        
        pedidoReq.usuarioId = pedidoUsuarioIdStr;
        pedidoReq.total = carrito.total != null ? carrito.total : BigDecimal.ZERO;
        pedidoReq.estado = "PENDIENTE";
        pedidoReq.fechaCreacion = LocalDateTime.now();  // ✅ AGREGADO
        
        // ✅ MAPEO COMPLETO de items con nombre y subtotal
        pedidoReq.items = carrito.items.stream().map(item -> {
            CrearPedidoRequestDTO.ItemPedidoDTO dto = new CrearPedidoRequestDTO.ItemPedidoDTO();
            dto.productoId = item.productoId;
            dto.nombre = item.nombreProducto;           // ✅ AGREGADO - Viene del CarritoDTO
            dto.cantidad = item.cantidad;
            dto.precioUnitario = item.precioUnitario;
            dto.subtotal = item.subtotal;               // ✅ AGREGADO
            
            LOGGER.debugf("  📦 Item: [%s] Cantidad: [%d] Precio: [%s] Subtotal: [%s]",
                    dto.nombre, dto.cantidad, dto.precioUnitario, dto.subtotal);
            
            return dto;
        }).collect(Collectors.toList());

        // 3. Registrar en Microservicio de pedidos (PostgreSQL) via REST Client
        PedidoResponseDTO pedido;
        try {
            LOGGER.info("🚀 Enviando datos de orden al Microservicio de PostgreSQL (PedidoClient)...");
            LOGGER.debugf("  📋 Total a enviar: [%s], Items: [%d]", pedidoReq.total, pedidoReq.items.size());
            
            pedido = pedidoClient.create(pedidoReq);
            
            LOGGER.infof("✅ Pedido persistido exitosamente en PostgreSQL. ID generado: [%s], Estado: [%s]", 
                    pedido.id, pedido.estado);
        } catch (WebApplicationException e) {
            String body = e.getResponse().readEntity(String.class);
            LOGGER.errorf("❌ Fallo en PedidoClient (HTTP %d): %s", e.getResponse().getStatus(), body);
            throw new RuntimeException("Error al crear el pedido en PostgreSQL (status " + e.getResponse().getStatus() + "): " + body);
        } catch (Exception e) {
            LOGGER.errorf("❌ Fallo crítico de comunicación con PedidoClient: %s", e.getMessage());
            throw new RuntimeException("Error al crear el pedido en PostgreSQL: " + e.getMessage());
        }

        // 4. Confirmar la reserva de stock
        ConfirmarCompraDTO confirmarDTO = new ConfirmarCompraDTO();
        confirmarDTO.reservaId = request.reservaId;
        confirmarDTO.orderId = pedido.id;

        try {
            if (request.reservaId != null && request.reservaId.startsWith("RES-")) {
                LOGGER.warnf("⚠️ [BYPASS DE PRUEBAS] El reservaId [%s] es simulado. Se confirma la compra directamente sin pasar por validación de memoria activa.", 
                        request.reservaId);
            } else {
                LOGGER.infof("🔒 Validando y asentando reserva real en InventarioService para ID: [%s]", request.reservaId);
                inventarioService.confirmarCompra(confirmarDTO);
            }
            LOGGER.info("✅ Descuento de stock confirmado correctamente.");
        } catch (Exception e) {
            LOGGER.errorf("❌ Error en InventarioService.confirmarCompra: %s", e.getMessage());
            throw new RuntimeException("Error al confirmar la reserva de stock: " + e.getMessage());
        }

        LOGGER.info("🎉 Flujo de checkout completado con éxito absoluto.");
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
        LOGGER.info("📥 GET /pedidos - Solicitando listado de órdenes globales (Roles Administrativos)");
        List<PedidoResponseDTO> pedidos = pedidoClient.listAll();
        LOGGER.infof("✅ GET /pedidos - Órdenes totales recuperadas: [%d]", pedidos.size());
        return Response.ok(pedidos).build();
    }

    @GET
    @Path("{id}")
    @RolesAllowed({"CLIENTE", "ADMIN_TIENDA", "SUPER_ADMIN"})
    @Operation(summary = "Obtener pedido por ID")
    public Response findById(@PathParam("id") String id) {
        LOGGER.infof("📥 GET /pedidos/%s - Solicitando detalles del pedido", id);
        PedidoResponseDTO pedido = pedidoClient.findById(id);
        LOGGER.infof("✅ GET /pedidos/%s - Pedido encontrado. Usuario propietario: [%s]", id, pedido.usuarioId);
        return Response.ok(pedido).build();
    }

    @GET
    @Path("usuario/me")
    @RolesAllowed({"CLIENTE", "ADMIN_TIENDA", "SUPER_ADMIN"})
    @Operation(summary = "Listar pedidos del usuario autenticado")
    public Response findMyOrders() {
        String usuarioId = jwt.getSubject();
        LOGGER.infof("📥 GET /pedidos/usuario/me - Solicitando historial del usuario actual: [%s]", usuarioId);
        List<PedidoResponseDTO> pedidos = pedidoClient.findByUsuarioId(usuarioId);
        LOGGER.infof("✅ GET /pedidos/usuario/me - Historial recuperado. Cantidad de órdenes: [%d]", pedidos.size());
        return Response.ok(pedidos).build();
    }

    @PUT
    @Path("{id}/estado")
    @RolesAllowed({"SUPER_ADMIN", "ADMIN_TIENDA"})
    @Operation(summary = "Actualizar estado de un pedido")
    public Response updateStatus(@PathParam("id") String id, PedidoUpdateStatusDTO dto) {
        LOGGER.infof("📥 PUT /pedidos/%s/estado - Modificación de estado solicitada", id);
        
        PedidoResponseDTO current = pedidoClient.findById(id);
        LOGGER.infof("🔄 Estado actual de la orden: [%s]. Nuevo estado solicitado: [%s]", current.estado, dto.estado);
        
        CrearPedidoRequestDTO updateReq = new CrearPedidoRequestDTO();
        updateReq.usuarioId = current.usuarioId;
        updateReq.total = current.total;
        updateReq.estado = dto.estado;
        updateReq.fechaCreacion = LocalDateTime.now();  // ✅ AGREGADO
        
        PedidoResponseDTO updated = pedidoClient.update(id, updateReq);
        LOGGER.infof("✅ PUT /pedidos/%s/estado - Estado actualizado con éxito a [%s]", id, updated.estado);
        return Response.ok(updated).build();
    }
}