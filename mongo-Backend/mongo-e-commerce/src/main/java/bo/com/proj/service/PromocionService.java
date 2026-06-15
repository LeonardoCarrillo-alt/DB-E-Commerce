package bo.com.proj.service;

import bo.com.proj.dto.*;
import bo.com.proj.entity.Promocion;
import bo.com.proj.exception.ValidationException;
import bo.com.proj.repository.PromocionRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.bson.types.ObjectId;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@ApplicationScoped
public class PromocionService {
    
    private static final Logger log = LoggerFactory.getLogger(PromocionService.class);
    
    @Inject
    PromocionRepository promocionRepository;
    
    // Aplicar promoción por código
    public ResultadoPromocionDTO aplicarPromocionPorCodigo(AplicarPromocionDTO dto, 
                                                             CalcularDescuentoDTO carrito) {
        ResultadoPromocionDTO resultado = new ResultadoPromocionDTO();
        
        // 1. Buscar promoción por código
        Promocion promocion = promocionRepository.findByCodigoAndVigente(
            dto.codigoPromocion, LocalDateTime.now()
        );
        
        if (promocion == null) {
            resultado.errores.add("Código promocional inválido o expirado");
            return resultado;
        }
        
        // 2. Validar condiciones
        List<String> errores = validarPromocion(promocion, dto, carrito);
        if (!errores.isEmpty()) {
            resultado.errores.addAll(errores);
            return resultado;
        }
        
        // 3. Calcular descuento según tipo
        BigDecimal descuento = calcularDescuento(promocion, carrito, resultado);
        
        if (descuento.compareTo(BigDecimal.ZERO) > 0) {
            resultado.descuentoAplicado = descuento;
            resultado.nuevoTotal = carrito.subtotal.subtract(descuento);
            
            ResultadoPromocionDTO.PromocionAplicadaDTO aplicada = new ResultadoPromocionDTO.PromocionAplicadaDTO();
            aplicada.promocionId = promocion.id.toString();
            aplicada.nombre = promocion.nombre;
            aplicada.codigo = promocion.codigo;
            aplicada.tipo = promocion.tipo;
            aplicada.descuento = descuento;
            aplicada.detalle = generarDetalle(promocion, descuento);
            resultado.promocionesAplicadas.add(aplicada);
            
            resultado.mensajes.add("¡Promoción aplicada! " + aplicada.detalle);
        }
        
        return resultado;
    }
    
    // Aplicar promociones automáticas (sin código)
    public ResultadoPromocionDTO aplicarPromocionesAutomaticas(CalcularDescuentoDTO carrito) {
        ResultadoPromocionDTO resultado = new ResultadoPromocionDTO();
        resultado.descuentoAplicado = BigDecimal.ZERO;
        
        // Obtener promociones automáticas vigentes
        List<Promocion> promociones = promocionRepository.findPromocionesAutomaticas(LocalDateTime.now());
        
        // Ordenar por prioridad (mayor primero)
        promociones.sort((a, b) -> b.prioridad.compareTo(a.prioridad));
        
        Set<String> promocionesAplicadasIds = new HashSet<>();
        BigDecimal subtotalOriginal = carrito.subtotal;
        
        for (Promocion promocion : promociones) {
            // Verificar si es apilable o ya hay promo aplicada
            if (!resultado.promocionesAplicadas.isEmpty() && !promocion.apilable) {
                continue;
            }
            
            // Verificar exclusiones
            boolean excluida = resultado.promocionesAplicadas.stream()
                .anyMatch(p -> promocion.promocionesExcluyentes != null && 
                               promocion.promocionesExcluyentes.contains(p.promocionId));
            if (excluida) continue;
            
            // Validar condiciones
            AplicarPromocionDTO dto = new AplicarPromocionDTO();
            dto.codigoPromocion = promocion.codigo;
            dto.usuarioId = carrito.usuarioId;
            dto.rolUsuario = carrito.rolUsuario;
            dto.esPrimeraCompra = carrito.esPrimeraCompra;
            
            List<String> errores = validarPromocion(promocion, dto, carrito);
            if (!errores.isEmpty()) continue;
            
            // Calcular descuento sobre el subtotal actual (puede incluir descuentos anteriores)
            BigDecimal descuento = calcularDescuento(promocion, carrito, resultado);
            
            if (descuento.compareTo(BigDecimal.ZERO) > 0) {
                resultado.descuentoAplicado = resultado.descuentoAplicado.add(descuento);
                promocionesAplicadasIds.add(promocion.id.toString());
                
                ResultadoPromocionDTO.PromocionAplicadaDTO aplicada = new ResultadoPromocionDTO.PromocionAplicadaDTO();
                aplicada.promocionId = promocion.id.toString();
                aplicada.nombre = promocion.nombre;
                aplicada.codigo = promocion.codigo != null ? promocion.codigo : "automática";
                aplicada.tipo = promocion.tipo;
                aplicada.descuento = descuento;
                aplicada.detalle = generarDetalle(promocion, descuento);
                resultado.promocionesAplicadas.add(aplicada);
                
                resultado.mensajes.add("Aplicada: " + aplicada.detalle);
                
                // Actualizar subtotal para próximas promociones (si son apilables)
                if (promocion.apilable) {
                    carrito.subtotal = carrito.subtotal.subtract(descuento);
                } else {
                    break; // No aplicar más promociones si no es apilable
                }
            }
        }
        
        resultado.nuevoTotal = subtotalOriginal.subtract(resultado.descuentoAplicado);
        return resultado;
    }
    
    // Validar todas las condiciones de una promoción
    private List<String> validarPromocion(Promocion p, AplicarPromocionDTO dto, 
                                           CalcularDescuentoDTO carrito) {
        List<String> errores = new ArrayList<>();
        
        // Vigencia
        if (!p.estaVigente()) {
            errores.add("Promoción no vigente");
        }
        
        // Usos disponibles
        if (!p.tieneUsosDisponibles()) {
            errores.add("La promoción ha alcanzado su límite de usos");
        }
        
        // Usos por usuario
        if (p.usosPorUsuario != null && p.usosPorUsuario > 0 && dto.usuarioId != null) {
            long usosUsuario = promocionRepository.countUsosByUsuario(p.id.toString(), dto.usuarioId);
            if (usosUsuario >= p.usosPorUsuario) {
                errores.add("Ya has usado esta promoción el máximo de veces permitido");
            }
        }
        
        // Usuarios específicos
        if (p.usuariosEspecificos != null && !p.usuariosEspecificos.isEmpty()) {
            if (dto.usuarioId == null || !p.usuariosEspecificos.contains(dto.usuarioId)) {
                errores.add("Esta promoción no está disponible para tu usuario");
            }
        }
        
        // Roles permitidos
        if (p.rolesPermitidos != null && !p.rolesPermitidos.isEmpty()) {
            if (dto.rolUsuario == null || !p.rolesPermitidos.contains(dto.rolUsuario)) {
                errores.add("Esta promoción no está disponible para tu nivel de usuario");
            }
        }
        
        // Primera compra
        if (p.soloPrimeraCompra && !Boolean.TRUE.equals(dto.esPrimeraCompra)) {
            errores.add("Esta promoción es solo para tu primera compra");
        }
        
        // Monto mínimo
        if (p.montoMinimoCompra != null && carrito.subtotal.compareTo(p.montoMinimoCompra) < 0) {
            errores.add("Monto mínimo de compra: " + p.montoMinimoCompra);
        }
        
        // Cantidad mínima de items
        if (p.cantidadMinimaItems != null && carrito.cantidadItems < p.cantidadMinimaItems) {
            errores.add("Cantidad mínima de productos: " + p.cantidadMinimaItems);
        }
        
        // Validar que el carrito tenga al menos un producto que aplique
        if (!validarProductosEnPromocion(p, carrito)) {
            errores.add("Esta promoción no aplica a los productos en tu carrito");
        }
        
        return errores;
    }
    
    // Validar que el carrito tenga productos que aplican a la promoción
    private boolean validarProductosEnPromocion(Promocion p, CalcularDescuentoDTO carrito) {
        if (carrito.items == null || carrito.items.isEmpty()) return false;
        
        for (CalcularDescuentoDTO.ItemCalculoDTO item : carrito.items) {
            // Verificar si el producto está excluido
            if (p.productosExcluidos != null && p.productosExcluidos.contains(item.productoId)) {
                continue;
            }
            
            // Verificar si aplica por producto específico
            if (p.productosAplican != null && p.productosAplican.contains(item.productoId)) {
                return true;
            }
            
            // Verificar si aplica por categoría
            if (p.categoriasAplican != null && p.categoriasAplican.contains(item.categoria)) {
                return true;
            }
            
            // Verificar si aplica por tienda
            if (p.tiendasAplican != null && p.tiendasAplican.contains(item.tiendaId)) {
                return true;
            }
        }
        
        return false;
    }
    
    // Calcular descuento según tipo de promoción
    private BigDecimal calcularDescuento(Promocion p, CalcularDescuentoDTO carrito, 
                                          ResultadoPromocionDTO resultado) {
        switch (p.tipo) {
            case "PORCENTAJE":
                return calcularDescuentoPorcentaje(p, carrito);
                
            case "MONTO_FIJO":
                return p.valor != null ? p.valor : BigDecimal.ZERO;
                
            case "ENVIO_GRATIS":
                // Envío gratis se maneja aparte, retornamos 0 aquí
                resultado.mensajes.add("Envío gratis aplicado al pedido");
                return BigDecimal.ZERO;
                
            case "2X1":
                return calcularDescuento2x1(p, carrito);
                
            case "COMPRA_LLEVA":
                return calcularDescuentoCompraLleva(p, carrito);
                
            default:
                return BigDecimal.ZERO;
        }
    }
    
    // Descuento porcentual
    private BigDecimal calcularDescuentoPorcentaje(Promocion p, CalcularDescuentoDTO carrito) {
        // Calcular subtotal de productos que aplican
        BigDecimal subtotalAplicable = calcularSubtotalAplicable(p, carrito);
        
        BigDecimal descuento = subtotalAplicable
            .multiply(p.valor)
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        
        // Aplicar tope máximo
        if (p.maximoDescuento != null && descuento.compareTo(p.maximoDescuento) > 0) {
            descuento = p.maximoDescuento;
        }
        
        return descuento;
    }
    
    // Promoción 2x1
    private BigDecimal calcularDescuento2x1(Promocion p, CalcularDescuentoDTO carrito) {
        BigDecimal descuento = BigDecimal.ZERO;
        Map<String, Integer> productosAplicables = new HashMap<>();
        
        // Contar cantidad de productos que aplican
        for (CalcularDescuentoDTO.ItemCalculoDTO item : carrito.items) {
            if (productoAplicaPromocion(p, item)) {
                productosAplicables.put(item.productoId, 
                    productosAplicables.getOrDefault(item.productoId, 0) + item.cantidad);
            }
        }
        
        // Calcular cuántos productos gratis (cada 2 pagas 1)
        int maxAplicaciones = p.reglas != null && p.reglas.containsKey("maxAplicaciones") ?
            (Integer) p.reglas.get("maxAplicaciones") : Integer.MAX_VALUE;
        
        int aplicaciones = 0;
        for (Map.Entry<String, Integer> entry : productosAplicables.entrySet()) {
            int pares = entry.getValue() / 2;
            int aAplicar = Math.min(pares, maxAplicaciones - aplicaciones);
            
            // Buscar el precio del producto para el descuento
            for (CalcularDescuentoDTO.ItemCalculoDTO item : carrito.items) {
                if (item.productoId.equals(entry.getKey())) {
                    descuento = descuento.add(item.precioUnitario.multiply(BigDecimal.valueOf(aAplicar)));
                    aplicaciones += aAplicar;
                    break;
                }
            }
            
            if (aplicaciones >= maxAplicaciones) break;
        }
        
        return descuento;
    }
    
    // Promoción "Compra X y lleva Y con descuento"
    private BigDecimal calcularDescuentoCompraLleva(Promocion p, CalcularDescuentoDTO carrito) {
        if (p.reglas == null) return BigDecimal.ZERO;
        
        String productoLlevaId = (String) p.reglas.get("productoLlevaId");
        Integer cantidadLleva = (Integer) p.reglas.getOrDefault("cantidadLleva", 1);
        Integer porcentajeDescuento = (Integer) p.reglas.get("porcentajeDescuento");
        
        if (productoLlevaId == null || porcentajeDescuento == null) return BigDecimal.ZERO;
        
        // Verificar si el producto "productoLlevaId" está en el carrito
        for (CalcularDescuentoDTO.ItemCalculoDTO item : carrito.items) {
            if (item.productoId.equals(productoLlevaId) && item.cantidad >= cantidadLleva) {
                int vecesAplica = item.cantidad / cantidadLleva;
                BigDecimal precioItem = item.precioUnitario;
                BigDecimal descuentoPorItem = precioItem
                    .multiply(BigDecimal.valueOf(porcentajeDescuento))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                
                return descuentoPorItem.multiply(BigDecimal.valueOf(vecesAplica));
            }
        }
        
        return BigDecimal.ZERO;
    }
    
    // Calcular subtotal solo de productos que aplican a la promoción
    private BigDecimal calcularSubtotalAplicable(Promocion p, CalcularDescuentoDTO carrito) {
        BigDecimal subtotal = BigDecimal.ZERO;
        
        for (CalcularDescuentoDTO.ItemCalculoDTO item : carrito.items) {
            if (productoAplicaPromocion(p, item)) {
                subtotal = subtotal.add(item.subtotal);
            }
        }
        
        return subtotal;
    }
    
    // Verificar si un producto individual aplica a la promoción
    private boolean productoAplicaPromocion(Promocion p, CalcularDescuentoDTO.ItemCalculoDTO item) {
        // Excluidos
        if (p.productosExcluidos != null && p.productosExcluidos.contains(item.productoId)) {
            return false;
        }
        
        // Productos específicos
        if (p.productosAplican != null && !p.productosAplican.isEmpty()) {
            return p.productosAplican.contains(item.productoId);
        }
        
        // Categorías
        if (p.categoriasAplican != null && !p.categoriasAplican.isEmpty()) {
            return p.categoriasAplican.contains(item.categoria);
        }
        
        // Tiendas
        if (p.tiendasAplican != null && !p.tiendasAplican.isEmpty()) {
            return p.tiendasAplican.contains(item.tiendaId);
        }
        
        return true; // Si no hay restricciones, aplica a todo
    }
    
    // Generar mensaje descriptivo del descuento
    private String generarDetalle(Promocion p, BigDecimal descuento) {
        switch (p.tipo) {
            case "PORCENTAJE":
                return p.valor + "% de descuento (ahorro " + descuento + ")";
            case "MONTO_FIJO":
                return "Descuento de " + descuento;
            case "ENVIO_GRATIS":
                return "Envío gratis";
            case "2X1":
                return "2x1 - Llevas 2 pagas 1";
            case "COMPRA_LLEVA":
                return "Compra y lleva con descuento";
            default:
                return p.nombre;
        }
    }
    
    // CRUD para administración de promociones
    public PromocionDTO crearPromocion(PromocionDTO dto, String creadoPor) {
        Promocion p = new Promocion();
        p.nombre = dto.nombre;
        p.descripcion = dto.descripcion;
        p.codigo = dto.codigo;
        p.tipo = dto.tipo;
        p.valor = dto.valor;
        p.maximoDescuento = dto.maximoDescuento;
        p.montoMinimoCompra = dto.montoMinimoCompra;
        p.cantidadMinimaItems = dto.cantidadMinimaItems;
        p.categoriasAplican = dto.categoriasAplican;
        p.tiendasAplican = dto.tiendasAplican;
        p.productosAplican = dto.productosAplican;
        p.productosExcluidos = dto.productosExcluidos;
        p.reglas = dto.reglas;
        p.usosMaximos = dto.usosMaximos;
        p.usosPorUsuario = dto.usosPorUsuario;
        p.fechaInicio = dto.fechaInicio;
        p.fechaFin = dto.fechaFin;
        p.usuariosEspecificos = dto.usuariosEspecificos;
        p.rolesPermitidos = dto.rolesPermitidos;
        p.soloPrimeraCompra = dto.soloPrimeraCompra != null ? dto.soloPrimeraCompra : false;
        p.activo = dto.activo != null ? dto.activo : true;
        p.prioridad = dto.prioridad != null ? dto.prioridad : 0;
        p.apilable = dto.apilable != null ? dto.apilable : false;
        p.promocionesExcluyentes = dto.promocionesExcluyentes;
        p.creadoPor = creadoPor;
        p.fechaActualizacion = LocalDateTime.now();
        
        promocionRepository.persist(p);
        
        dto.id = p.id.toString();
        return dto;
    }
    
    public void eliminarPromocion(String id) {
        promocionRepository.deleteById(new ObjectId(id));
    }
    
    public List<PromocionDTO> listarPromocionesVigentes() {
        return promocionRepository.findPromocionesAutomaticas(LocalDateTime.now())
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    private PromocionDTO toDTO(Promocion p) {
        PromocionDTO dto = new PromocionDTO();
        dto.id = p.id.toString();
        dto.nombre = p.nombre;
        dto.descripcion = p.descripcion;
        dto.codigo = p.codigo;
        dto.tipo = p.tipo;
        dto.valor = p.valor;
        dto.maximoDescuento = p.maximoDescuento;
        dto.montoMinimoCompra = p.montoMinimoCompra;
        dto.cantidadMinimaItems = p.cantidadMinimaItems;
        dto.categoriasAplican = p.categoriasAplican;
        dto.tiendasAplican = p.tiendasAplican;
        dto.productosAplican = p.productosAplican;
        dto.productosExcluidos = p.productosExcluidos;
        dto.reglas = p.reglas;
        dto.usosMaximos = p.usosMaximos;
        dto.usosPorUsuario = p.usosPorUsuario;
        dto.fechaInicio = p.fechaInicio;
        dto.fechaFin = p.fechaFin;
        dto.usuariosEspecificos = p.usuariosEspecificos;
        dto.rolesPermitidos = p.rolesPermitidos;
        dto.soloPrimeraCompra = p.soloPrimeraCompra;
        dto.activo = p.activo;
        dto.prioridad = p.prioridad;
        dto.apilable = p.apilable;
        dto.promocionesExcluyentes = p.promocionesExcluyentes;
        dto.vigente = p.estaVigente();
        dto.usosDisponibles = p.usosMaximos != null ? p.usosMaximos - p.usosActuales : null;
        return dto;
    }
}
