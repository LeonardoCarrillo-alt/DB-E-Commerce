package bo.com.proj.service;

import bo.com.proj.dto.ActualizarItemDTO;
import bo.com.proj.dto.AgregarItemDTO;
import bo.com.proj.dto.AplicarPromocionDTO;
import bo.com.proj.dto.CalcularDescuentoDTO;
import bo.com.proj.dto.CarritoDTO;
import bo.com.proj.dto.ReservaStockDTO;
import bo.com.proj.dto.ResultadoPromocionDTO;
import bo.com.proj.entity.Carrito;
import bo.com.proj.entity.Producto;
import bo.com.proj.entity.Promocion;
import bo.com.proj.exception.NotFoundException;
import bo.com.proj.exception.ValidationException;
import bo.com.proj.repository.CarritoRepository;
import bo.com.proj.repository.ProductoRepository;
import bo.com.proj.repository.PromocionRepository;
import org.bson.types.ObjectId;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.bson.types.ObjectId;

@ApplicationScoped
public class CarritoService {
    
    private static final Logger LOGGER = Logger.getLogger(CarritoService.class);
    
    @Inject
    CarritoRepository carritoRepository;
    
    @Inject
    ProductoRepository productoRepository;
    
    @Inject
    PromocionRepository promocionRepository;
    
    @Inject
    InventarioService inventarioService;

    @Inject
    PromocionService promocionService;

    private void recalcularPromociones(Carrito carrito, String usuarioId, String rol, boolean primeraCompra) {
        // Construir DTO para cálculo
        CalcularDescuentoDTO calculoDTO = new CalcularDescuentoDTO();
        calculoDTO.usuarioId = usuarioId;
        calculoDTO.rolUsuario = rol;
        calculoDTO.esPrimeraCompra = primeraCompra;
        calculoDTO.subtotal = carrito.subtotal;
        calculoDTO.cantidadItems = carrito.items.size();
        calculoDTO.items = carrito.items.stream().map(item -> {
            CalcularDescuentoDTO.ItemCalculoDTO dto = new CalcularDescuentoDTO.ItemCalculoDTO();
            dto.productoId = item.productoId;
            dto.categoria = item.categoria;
            dto.tiendaId = item.tiendaId;
            dto.cantidad = item.cantidad;
            dto.precioUnitario = item.precioUnitario;
            dto.subtotal = item.subtotal;
            return dto;
        }).collect(Collectors.toList());
        
        // Aplicar promociones automáticas
        ResultadoPromocionDTO resultado = promocionService.aplicarPromocionesAutomaticas(calculoDTO);
        
        // Actualizar carrito con el descuento
        carrito.descuento = resultado.descuentoAplicado;
        carrito.total = carrito.subtotal.subtract(carrito.descuento);
    }
    
    // Obtener carrito activo por usuario
    public CarritoDTO getCarritoByUsuario(String usuarioId, Boolean esInvitado) {
        Optional<Carrito> carritoOpt;
        
        if (esInvitado) {
            carritoOpt = carritoRepository.findInvitadoBySessionId(usuarioId);
        } else {
            carritoOpt = carritoRepository.findByUsuarioId(usuarioId);
        }
        
        Carrito carrito = carritoOpt.orElseGet(() -> crearNuevoCarrito(usuarioId, null, esInvitado));
        return toDTO(carrito);
    }
    
    // Crear nuevo carrito
    public Carrito crearNuevoCarrito(String usuarioIdOSessionId, String usuarioEmail, Boolean esInvitado) {
        Carrito carrito = new Carrito();
        if (esInvitado) {
            carrito.sessionId = usuarioIdOSessionId;
            carrito.usuarioId = null;
        } else {
            carrito.usuarioId = usuarioIdOSessionId;
            carrito.sessionId = null;
        }
        carrito.usuarioEmail = usuarioEmail;
        carrito.invitado = esInvitado;
        carrito.estado = "ACTIVO";
        carrito.fechaCreacion = LocalDateTime.now();
        carrito.fechaActualizacion = LocalDateTime.now();
        carritoRepository.persist(carrito);
        return carrito;
    }
    
    public CarritoDTO agregarItem(AgregarItemDTO dto, Boolean esInvitado) {

        if (dto.usuarioId == null || dto.usuarioId.trim().isEmpty()) {
            throw new ValidationException("usuarioId es requerido");
        }
        
        Carrito carrito = getCarritoEntity(dto.usuarioId, dto.usuarioEmail, esInvitado);
        
        Producto producto = productoRepository.findById(new ObjectId(dto.productoId));
        if (producto == null) {
            throw new NotFoundException("Producto no encontrado: " + dto.productoId);
        }
        
        if (!producto.activo) {
            throw new ValidationException("El producto no está disponible");
        }
        
        int stockDisponible = inventarioService.getStockByProducto(producto.id.toString());
        int cantidadActual = carrito.items.stream()
                .filter(i -> i.productoId.equals(dto.productoId) && 
                             Carrito.isSameVariantStatic(i.variante, dto.variante))
                .mapToInt(i -> i.cantidad)
                .sum();
        
        int nuevaCantidad = cantidadActual + dto.cantidad;
        if (nuevaCantidad > stockDisponible) {
            throw new ValidationException("Stock insuficiente. Disponible: " + stockDisponible);
        }
        
        Carrito.ItemCarrito nuevoItem = new Carrito.ItemCarrito();
        nuevoItem.productoId = dto.productoId;
        nuevoItem.nombreProducto = producto.nombre;
        nuevoItem.categoria = producto.categoria;
        nuevoItem.tiendaId = producto.tiendaId;
        nuevoItem.cantidad = dto.cantidad;
        nuevoItem.precioUnitario = producto.precio;
        nuevoItem.subtotal = producto.precio.multiply(BigDecimal.valueOf(dto.cantidad));
        nuevoItem.variante = dto.variante;
        
        carrito.agregarItem(nuevoItem);
        carritoRepository.update(carrito);
        
        return toDTO(carrito);
    }
    
    public CarritoDTO actualizarItem(ActualizarItemDTO dto, String usuarioId, Boolean esInvitado) {
        Carrito carrito = getCarritoEntity(usuarioId, null, esInvitado);
        
        if (dto.cantidad <= 0) {
            carrito.eliminarItem(dto.productoId, dto.variante);
        } else {
            int stockDisponible = inventarioService.getStockByProducto(dto.productoId);
            if (dto.cantidad > stockDisponible) {
                throw new ValidationException("Stock insuficiente. Disponible: " + stockDisponible);
            }
            carrito.actualizarCantidad(dto.productoId, dto.variante, dto.cantidad);
        }
        
        carritoRepository.update(carrito);
        return toDTO(carrito);
    }
    
    public CarritoDTO eliminarItem(String productoId, String variante, String usuarioId, Boolean esInvitado) {
        Carrito carrito = getCarritoEntity(usuarioId, null, esInvitado);
        carrito.eliminarItem(productoId, variante);
        carritoRepository.update(carrito);
        return toDTO(carrito);
    }
    
    public CarritoDTO limpiarCarrito(String usuarioId, Boolean esInvitado) {
        Carrito carrito = getCarritoEntity(usuarioId, null, esInvitado);
        carrito.limpiarCarrito();
        carritoRepository.update(carrito);
        return toDTO(carrito);
    }
    
    public CarritoDTO aplicarPromocion(AplicarPromocionDTO dto, String usuarioId, Boolean esInvitado) {
        Carrito carrito = getCarritoEntity(usuarioId, null, esInvitado);
        
        Promocion promocion = promocionRepository.findByCodigoAndVigente(dto.codigoPromocion, LocalDateTime.now());
        if (promocion == null) {
            throw new NotFoundException("Promoción no válida o expirada");
        }
        
        BigDecimal descuentoAplicado = calcularDescuento(promocion, carrito);
        if (descuentoAplicado.compareTo(BigDecimal.ZERO) == 0) {
            throw new ValidationException("La promoción no aplica a los productos de tu carrito");
        }
        
        carrito.descuento = descuentoAplicado;
        carrito.codigoPromocion = dto.codigoPromocion;
        carrito.recalcularTotales();
        carritoRepository.update(carrito);
        
        return toDTO(carrito);
    }
    
    public CarritoDTO quitarPromocion(String usuarioId, Boolean esInvitado) {
        Carrito carrito = getCarritoEntity(usuarioId, null, esInvitado);
        carrito.descuento = BigDecimal.ZERO;
        carrito.codigoPromocion = null;
        carrito.recalcularTotales();
        carritoRepository.update(carrito);
        return toDTO(carrito);
    }
    
    public CarritoDTO getResumenCheckout(String usuarioId, Boolean esInvitado) {
        Carrito carrito = getCarritoEntity(usuarioId, null, esInvitado);
        
        if (carrito.items.isEmpty()) {
            throw new ValidationException("El carrito está vacío");
        }
        
        for (Carrito.ItemCarrito item : carrito.items) {
            int stockDisponible = inventarioService.getStockByProducto(item.productoId);
            if (item.cantidad > stockDisponible) {
                throw new ValidationException(
                    "Stock insuficiente para: " + item.nombreProducto + 
                    ". Disponible: " + stockDisponible
                );
            }
        }
        
        return toDTO(carrito);
    }
    
    public CarritoDTO migrarCarritoInvitado(String sessionId, String usuarioId, String usuarioEmail) {
        LOGGER.infof("=== MIGRAR CARRITO INVITADO === sessionId=%s, usuarioId=%s, usuarioEmail=%s", sessionId, usuarioId, usuarioEmail);
        
        // Buscar carrito invitado por sessionId
        Optional<Carrito> carritoInvitadoOpt = carritoRepository.findInvitadoBySessionId(sessionId);
        LOGGER.infof("Carrito invitado encontrado: %s", carritoInvitadoOpt.isPresent());
        
        // Buscar carrito del usuario por usuarioEmail (el email se usa como usuario_id en MongoDB)
        Optional<Carrito> carritoUsuarioOpt = carritoRepository.find("usuario_email = ?1", usuarioEmail)
                .firstResultOptional();
        
        if (!carritoUsuarioOpt.isPresent()) {
            // Si no encuentra por usuario_email, buscar por usuario_id
            carritoUsuarioOpt = carritoRepository.find("usuario_id", usuarioEmail)
                    .firstResultOptional();
            LOGGER.infof("Carrito usuario encontrado por usuario_id: %s", carritoUsuarioOpt.isPresent());
        } else {
            LOGGER.infof("Carrito usuario encontrado por usuario_email: %s", carritoUsuarioOpt.isPresent());
        }
        
        Carrito carritoDestino;
        
        if (carritoInvitadoOpt.isPresent()) {
            // Existe carrito invitado
            Carrito carritoInvitado = carritoInvitadoOpt.get();
            LOGGER.infof("Carrito invitado actual - usuarioId: %s, sessionId: %s", carritoInvitado.usuarioId, carritoInvitado.sessionId);
            
            if (carritoUsuarioOpt.isPresent()) {
                // Caso 1: Usuario ya tiene carrito → Fusionar items del invitado
                carritoDestino = carritoUsuarioOpt.get();
                LOGGER.infof("Caso 1: Merging guest cart into user cart");
                
                for (Carrito.ItemCarrito item : carritoInvitado.items) {
                    carritoDestino.agregarItem(item);
                }
                carritoDestino.fechaActualizacion = LocalDateTime.now();
                carritoRepository.update(carritoDestino);
                
                carritoInvitado.estado = "COMPLETADO";
                carritoInvitado.fechaActualizacion = LocalDateTime.now();
                carritoRepository.update(carritoInvitado);
            } else {
                // Caso 2: Solo existe carrito invitado → Migrar directamente
                LOGGER.infof("Caso 2: Migrating guest cart to user cart");
                carritoInvitado.usuarioId = usuarioEmail; // Usar email como usuario_id (coincide con índice)
                carritoInvitado.usuarioEmail = usuarioEmail;
                carritoInvitado.sessionId = null; // Limpiar sessionId después de migrar
                carritoInvitado.invitado = false;
                carritoInvitado.fechaActualizacion = LocalDateTime.now();
                carritoRepository.update(carritoInvitado);
                carritoDestino = carritoInvitado;
            }
        } else {
            // Caso 3: No existe carrito invitado
            LOGGER.infof("Caso 3: No guest cart found");
            if (carritoUsuarioOpt.isPresent()) {
                // Usuario ya tiene carrito registrado, solo retornarlo
                carritoDestino = carritoUsuarioOpt.get();
                LOGGER.infof("Returning existing user cart");
            } else {
                // No existe ningún carrito, retornar carrito vacío del usuario
                LOGGER.infof("No cart found, returning empty cart for user");
                carritoDestino = new Carrito();
                carritoDestino.usuarioId = usuarioEmail;
                carritoDestino.usuarioEmail = usuarioEmail;
                carritoDestino.invitado = false;
                carritoDestino.estado = "ACTIVO";
                carritoDestino.items = new java.util.ArrayList<>();
                carritoDestino.subtotal = BigDecimal.ZERO;
                carritoDestino.descuento = BigDecimal.ZERO;
                carritoDestino.total = BigDecimal.ZERO;
                carritoDestino.fechaCreacion = LocalDateTime.now();
                carritoDestino.fechaActualizacion = LocalDateTime.now();
                
                // NO guardamos, solo devolvemos el carrito vacío
                // Esto evita el E11000 duplicate key error
            }
        }
        
        return toDTO(carritoDestino);
    }
    // Procesar checkout completo (unificar reserva + preparar pago)
    public CheckoutResponseDTO procesarCheckout(String usuarioId, Boolean esInvitado) {
        // Obtener carrito
        Carrito carrito = getCarritoEntity(usuarioId, null, esInvitado);
        
        if (carrito.items.isEmpty()) {
            throw new ValidationException("El carrito está vacío");
        }
        
        // Validar stock
        Map<String, Boolean> validacion = inventarioService.validarStockItems(carrito);
        boolean todoDisponible = validacion.values().stream().allMatch(v -> v);
        
        if (!todoDisponible) {
            List<String> productosSinStock = validacion.entrySet().stream()
                .filter(e -> !e.getValue())
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
            throw new ValidationException("Productos sin stock: " + productosSinStock);
        }
        
        // Crear reserva de stock
        ReservaStockDTO reservaDTO = new ReservaStockDTO();
        reservaDTO.carritoId = carrito.id.toString();
        reservaDTO.usuarioId = usuarioId;
        reservaDTO.items = carrito.items.stream().map(item -> {
            ReservaStockDTO.ItemReservaDTO itemDTO = new ReservaStockDTO.ItemReservaDTO();
            itemDTO.productoId = item.productoId;
            itemDTO.variante = item.variante;
            itemDTO.cantidad = item.cantidad;
            return itemDTO;
        }).collect(Collectors.toList());
        
        String reservaId = inventarioService.reservarStockCarrito(reservaDTO);
        
        // Preparar respuesta para checkout
        CheckoutResponseDTO response = new CheckoutResponseDTO();
        response.reservaId = reservaId;
        response.carrito = toDTO(carrito);
        response.total = carrito.total;
        response.montoDescuento = carrito.descuento;
        
        return response;
    }

    public static class CheckoutResponseDTO {
        public String reservaId;
        public CarritoDTO carrito;
        public BigDecimal total;
        public BigDecimal montoDescuento;
    }
    private Carrito getCarritoEntity(String usuarioIdOSessionId, String usuarioEmail, Boolean esInvitado) {
        Optional<Carrito> carritoOpt;
        
        if (esInvitado) {
            carritoOpt = carritoRepository.findInvitadoBySessionId(usuarioIdOSessionId);
        } else {
            carritoOpt = carritoRepository.findByUsuarioId(usuarioIdOSessionId);
        }
        
        return carritoOpt.orElseGet(() -> crearNuevoCarrito(usuarioIdOSessionId, usuarioEmail, esInvitado));
    }
    
    private BigDecimal calcularDescuento(Promocion promocion, Carrito carrito) {
        if ("PORCENTAJE".equals(promocion.tipo)) {
            boolean aplica = true;
            
            if (promocion.montoMinimoCompra != null && carrito.subtotal.compareTo(promocion.montoMinimoCompra) < 0) {
                aplica = false;
            }
            
            if (promocion.categoriasAplican != null && !promocion.categoriasAplican.isEmpty()) {
                boolean algunaCategoria = carrito.items.stream()
                    .anyMatch(item -> promocion.categoriasAplican.contains(item.categoria));
                if (!algunaCategoria) aplica = false;
            }
            
            if (aplica) {
                return carrito.subtotal.multiply(promocion.valor).divide(BigDecimal.valueOf(100));
            }
        }
        
        if ("MONTO_FIJO".equals(promocion.tipo)) {
            return promocion.valor;
        }
        
        if ("ENVIO_GRATIS".equals(promocion.tipo)) {
            return BigDecimal.ZERO;
        }
        
        return BigDecimal.ZERO;
    }
    
    private CarritoDTO toDTO(Carrito carrito) {
        CarritoDTO dto = new CarritoDTO();
        dto.id = carrito.id.toString();
        dto.usuarioId = carrito.usuarioId;
        dto.usuarioEmail = carrito.usuarioEmail;
        dto.subtotal = carrito.subtotal;
        dto.descuento = carrito.descuento;
        dto.total = carrito.total;
        dto.codigoPromocion = carrito.codigoPromocion;
        dto.fechaCreacion = carrito.fechaCreacion;
        dto.fechaActualizacion = carrito.fechaActualizacion;
        dto.estado = carrito.estado;
        dto.invitado = carrito.invitado;
        
        dto.items = carrito.items.stream().map(item -> {
            CarritoDTO.ItemCarritoDTO itemDto = new CarritoDTO.ItemCarritoDTO();
            itemDto.productoId = item.productoId;
            itemDto.nombreProducto = item.nombreProducto;
            itemDto.categoria = item.categoria;
            itemDto.tiendaId = item.tiendaId;
            itemDto.cantidad = item.cantidad;
            itemDto.precioUnitario = item.precioUnitario;
            itemDto.subtotal = item.subtotal;
            itemDto.imagenUrl = item.imagenUrl;
            itemDto.variante = item.variante;
            itemDto.fechaAgregado = item.fechaAgregado;
            return itemDto;
        }).collect(Collectors.toList());
        
        return dto;
    }
    
    public static class Helper {
        public static boolean isSameVariantStatic(String v1, String v2) {
            if (v1 == null && v2 == null) return true;
            if (v1 == null || v2 == null) return false;
            return v1.equals(v2);
        }
    }
}
