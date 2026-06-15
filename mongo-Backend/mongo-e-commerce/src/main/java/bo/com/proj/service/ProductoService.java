package bo.com.proj.service;

import bo.com.proj.dto.FiltroBusquedaDTO;
import bo.com.proj.dto.ProductoDTO;
import bo.com.proj.entity.Producto;
import bo.com.proj.repository.ProductoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.bson.Document;
import org.bson.types.ObjectId;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class ProductoService {

    @Inject
    ProductoRepository productoRepository;

    public List<ProductoDTO> listAll() {
        return productoRepository.listAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ProductoDTO findById(String id) {
        Producto p = productoRepository.findById(new ObjectId(id));
        return p != null ? toDTO(p) : null;
    }

    public ProductoDTO create(ProductoDTO dto) {
        // Normalizar categoría a minúsculas (requiere coincidir con esquema MongoDB)
        if (dto.categoria != null) {
            dto.categoria = normalizarCategoria(dto.categoria);
        }
        // Validar tiendaId
        if (dto.tiendaId == null || dto.tiendaId.trim().isEmpty()) {
            throw new IllegalArgumentException("tiendaId es requerido");
        }
        Producto p = toEntity(dto);
        productoRepository.persist(p);
        return toDTO(p);
    }

    public boolean delete(String id) {
        return productoRepository.deleteById(new ObjectId(id));
    }

    public ProductoDTO update(String id, ProductoDTO dto) {
        Producto p = productoRepository.findById(new ObjectId(id));
        if (p == null) return null;
        p.nombre = dto.nombre;
        p.descripcion = dto.descripcion;
        p.precio = dto.precio;
        p.categoria = dto.categoria;
        p.tiendaId = dto.tiendaId;
        p.atributos = dto.atributos;
        if (dto.activo != null) p.activo = dto.activo;
        productoRepository.update(p);
        return toDTO(p);
    }

    public List<ProductoDTO> searchDynamic(FiltroBusquedaDTO filtro) {
        Document query = new Document();
        if (filtro.categoria != null) query.append("categoria", filtro.categoria);
        if (filtro.tiendaId != null) query.append("tiendaId", filtro.tiendaId);
        if (filtro.precioMin != null || filtro.precioMax != null) {
            Document precioQuery = new Document();
            if (filtro.precioMin != null) precioQuery.append("$gte", filtro.precioMin);
            if (filtro.precioMax != null) precioQuery.append("$lte", filtro.precioMax);
            query.append("precio", precioQuery);
        }
        if (filtro.atributos != null && !filtro.atributos.isEmpty()) {
            Document attrQuery = new Document();
            filtro.atributos.forEach((k, v) -> attrQuery.append("atributos." + k, v));
            query.putAll(attrQuery);
        }
        return productoRepository.searchWithDynamicAttributes(query).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private ProductoDTO toDTO(Producto p) {
        ProductoDTO dto = new ProductoDTO();
        dto.id = p.id.toString();
        dto.nombre = p.nombre;
        dto.descripcion = p.descripcion;
        dto.precio = p.precio;
        dto.categoria = p.categoria;
        dto.tiendaId = p.tiendaId;
        dto.atributos = p.atributos;
        dto.activo = p.activo;
        return dto;
    }

    private Producto toEntity(ProductoDTO dto) {
        Producto p = new Producto();
        p.nombre = dto.nombre;
        p.descripcion = dto.descripcion;
        p.precio = dto.precio;
        // Normalizar categoría
        p.categoria = dto.categoria != null ? normalizarCategoria(dto.categoria) : null;
        p.tiendaId = dto.tiendaId;
        p.atributos = dto.atributos;
        p.activo = dto.activo != null ? dto.activo : true;
        return p;
    }

    /**
     * Normaliza el nombre de categoría a minúsculas sin acentos.
     * Mapea valores como "Electrónica" -> "electronica", "Ropa" -> "ropa", etc.
     */
    private String normalizarCategoria(String categoria) {
        if (categoria == null) return null;
        String normalized = categoria.toLowerCase()
                .replaceAll("á", "a")
                .replaceAll("é", "e")
                .replaceAll("í", "i")
                .replaceAll("ó", "o")
                .replaceAll("ú", "u")
                .replaceAll(" ", "_")
                .trim();
        
        // Mapear alias a valores del esquema MongoDB
        switch (normalized) {
            case "ropa":
                return "ropa";
            case "electronica":
                return "electronica";
            case "muebles":
                return "muebles";
            case "adornos":
                return "adornos";
            case "utensilios_cocina":
            case "utensilios_de_cocina":
            case "cocina":
                return "utensilios_cocina";
            default:
                throw new IllegalArgumentException("Categoría inválida: " + categoria + ". Valores válidos: ropa, electronica, muebles, adornos, utensilios_cocina");
        }
    }
}
