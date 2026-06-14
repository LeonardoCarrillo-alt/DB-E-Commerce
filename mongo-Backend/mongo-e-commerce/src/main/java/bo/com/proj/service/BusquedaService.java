package bo.com.proj.service;

import bo.com.proj.dto.BusquedaProductoDTO;
import bo.com.proj.dto.ProductoDTO;
import bo.com.proj.dto.ResultadoBusquedaDTO;
import bo.com.proj.dto.SugerenciaDTO;
import bo.com.proj.entity.HistorialBusqueda;
import bo.com.proj.entity.Producto;
import bo.com.proj.repository.HistorialBusquedaRepository;
import bo.com.proj.repository.ProductoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@ApplicationScoped
public class BusquedaService {
    
    @Inject
    ProductoRepository productoRepository;
    
    @Inject
    HistorialBusquedaRepository historialRepository;
    
    @Inject
    InventarioService inventarioService;
    
    // Búsqueda principal
    public ResultadoBusquedaDTO<ProductoDTO> buscar(BusquedaProductoDTO filtros, String usuarioId) {
        // Guardar en historial si usuario está autenticado
        if (usuarioId != null && filtros.query != null && !filtros.query.isEmpty()) {
            guardarHistorialBusqueda(usuarioId, filtros.query);
        }
        
        // Ejecutar búsqueda
        ResultadoBusquedaDTO<Producto> resultado = productoRepository.buscarAvanzado(filtros);
        
        // Convertir a DTO y enriquecer con información de stock
        ResultadoBusquedaDTO<ProductoDTO> resultadoDTO = new ResultadoBusquedaDTO<>();
        resultadoDTO.items = resultado.items.stream()
                .map(this::toDTOConStock)
                .collect(Collectors.toList());
        resultadoDTO.metadata = resultado.metadata;
        
        return resultadoDTO;
    }
    
    // Búsqueda rápida (autocompletado)
    public List<SugerenciaDTO> autocompletar(String termino, String usuarioId) {
        if (termino == null || termino.length() < 2) {
            return List.of();
        }
        
        // Obtener sugerencias del repositorio
        List<String> sugerencias = productoRepository.obtenerSugerencias(termino);
        
        // También obtener búsquedas populares de otros usuarios
        List<String> busquedasPopulares = historialRepository.findBusquedasPopulares(termino, 5);
        
        // Combinar y deduplicar
        List<String> todas = new java.util.ArrayList<>();
        todas.addAll(sugerencias);
        todas.addAll(busquedasPopulares);
        
        return todas.stream()
                .distinct()
                .limit(5)
                .map(s -> {
                    SugerenciaDTO sug = new SugerenciaDTO();
                    sug.termino = s;
                    sug.tipo = detectarTipoSugerencia(s);
                    return sug;
                })
                .collect(Collectors.toList());
    }
    
    // Productos destacados (homepage)
    public List<ProductoDTO> getProductosDestacados(String categoria, int limite) {
        List<Producto> productos = productoRepository.findProductosPopulares(categoria, limite);
        return productos.stream()
                .map(this::toDTOConStock)
                .collect(Collectors.toList());
    }
    
    // Productos relacionados
    public List<ProductoDTO> getProductosRelacionados(String productoId, String categoria, 
                                                       Map<String, Object> atributos, int limite) {
        List<Producto> productos = productoRepository.findProductosRelacionados(
            productoId, categoria, atributos, limite
        );
        return productos.stream()
                .map(this::toDTOConStock)
                .collect(Collectors.toList());
    }
    
    // Guardar historial de búsqueda
    private void guardarHistorialBusqueda(String usuarioId, String termino) {
        HistorialBusqueda historial = new HistorialBusqueda();
        historial.usuarioId = usuarioId;
        historial.termino = termino.toLowerCase().trim();
        historial.fecha = LocalDateTime.now();
        historialRepository.persist(historial);
    }
    
    // Detectar tipo de sugerencia
    private String detectarTipoSugerencia(String termino) {
        // Lógica simple para detectar si es categoría, marca, etc.
        List<String> categorias = List.of("ropa", "electronica", "muebles", "adornos", "utensilios");
        if (categorias.contains(termino.toLowerCase())) {
            return "categoria";
        }
        return "producto";
    }
    
    // Convertir a DTO con información de stock
    private ProductoDTO toDTOConStock(Producto p) {
        ProductoDTO dto = new ProductoDTO();
        dto.id = p.id.toString();
        dto.nombre = p.nombre;
        dto.descripcion = p.descripcion;
        dto.precio = p.precio;
        dto.categoria = p.categoria;
        dto.tiendaId = p.tiendaId;
        dto.atributos = p.atributos;
        dto.activo = p.activo;
        
        // Enriquecer con stock
        int stock = inventarioService.getStockDisponible(p.id.toString(), null);
        dto.stockDisponible = stock;
        dto.disponible = stock > 0;
        
        return dto;
    }
}