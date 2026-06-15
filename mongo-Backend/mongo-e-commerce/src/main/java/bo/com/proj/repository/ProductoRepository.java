package bo.com.proj.repository;

import bo.com.proj.dto.BusquedaProductoDTO;
import bo.com.proj.dto.ResultadoBusquedaDTO;
import bo.com.proj.entity.Producto;
import io.quarkus.mongodb.panache.PanacheMongoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.bson.Document;
import org.bson.conversions.Bson;
import com.mongodb.client.model.*;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@ApplicationScoped
public class ProductoRepository implements PanacheMongoRepository<Producto> {
    
    public List<Producto> findByCategoria(String categoria) {
        return list("categoria", categoria);
    }

    public List<Producto> findByTienda(String tiendaId) {
        return list("tiendaId", tiendaId);
    }

    public List<Producto> searchWithDynamicAttributes(Document filtros) {
        return mongoCollection().find(filtros).into(new ArrayList<>());
    }

    // Búsqueda avanzada con paginación y filtros
    public ResultadoBusquedaDTO<Producto> buscarAvanzado(BusquedaProductoDTO filtros) {
        long startTime = System.currentTimeMillis();
        
        // 1. Construir filtros
        List<Bson> filtrosList = new ArrayList<>();
        
        // Productos activos siempre
        filtrosList.add(Filters.eq("activo", true));
        
        // Búsqueda textual
        if (filtros.query != null && !filtros.query.trim().isEmpty()) {
            filtrosList.add(Filters.text(filtros.query));
        }
        
        // Categoría
        if (filtros.categoria != null && !filtros.categoria.isEmpty()) {
            filtrosList.add(Filters.eq("categoria", filtros.categoria));
        }
        
        // Tienda
        if (filtros.tiendaId != null && !filtros.tiendaId.isEmpty()) {
            filtrosList.add(Filters.eq("tiendaId", filtros.tiendaId));
        }
        
        // Múltiples tiendas
        if (filtros.tiendasIds != null && !filtros.tiendasIds.isEmpty()) {
            filtrosList.add(Filters.in("tiendaId", filtros.tiendasIds));
        }
        
        // Rango de precio
        if (filtros.precioMin != null || filtros.precioMax != null) {
            Document precioFilter = new Document();
            if (filtros.precioMin != null) {
                precioFilter.append("$gte", filtros.precioMin);
            }
            if (filtros.precioMax != null) {
                precioFilter.append("$lte", filtros.precioMax);
            }
            filtrosList.add(Filters.eq("precio", precioFilter));
        }
        
        // Atributos dinámicos
        if (filtros.atributos != null && !filtros.atributos.isEmpty()) {
            for (Map.Entry<String, Object> attr : filtros.atributos.entrySet()) {
                filtrosList.add(Filters.eq("atributos." + attr.getKey(), attr.getValue()));
            }
        }
        
        // Rango de fechas
        if (filtros.fechaDesde != null || filtros.fechaHasta != null) {
            Document fechaFilter = new Document();
            if (filtros.fechaDesde != null) {
                fechaFilter.append("$gte", filtros.fechaDesde);
            }
            if (filtros.fechaHasta != null) {
                fechaFilter.append("$lte", filtros.fechaHasta);
            }
            filtrosList.add(Filters.eq("fechaCreacion", fechaFilter));
        }
        
        Bson filtroFinal = filtrosList.isEmpty() ? new Document() : Filters.and(filtrosList);
        
        // 2. Construir ordenamiento
        Bson orden = getOrdenamiento(filtros.ordenarPor, filtros.ordenDireccion);
        
        // 3. Calcular paginación
        int pagina = Math.max(filtros.pagina, 1);
        int limite = Math.min(filtros.limite, 100);
        int skip = (pagina - 1) * limite;
        
        // 4. Ejecutar consulta principal
        List<Producto> productos = mongoCollection()
                .find(filtroFinal)
                .sort(orden)
                .skip(skip)
                .limit(limite)
                .into(new ArrayList<>());
        
        // 5. Contar total
        long total = count(filtroFinal);
        
        // 6. Calcular total de páginas
        long totalPaginas = (long) Math.ceil((double) total / limite);
        
        // 7. Obtener sugerencias (si hay query)
        List<String> sugerencias = new ArrayList<>();
        if (filtros.query != null && !filtros.query.isEmpty()) {
            sugerencias = obtenerSugerencias(filtros.query);
        }
        
        // 8. Obtener facets para filtros laterales
        Map<String, ResultadoBusquedaDTO.FacetCount> facets = new HashMap<>();
        if (total > 0) {
            facets = obtenerFacets(filtroFinal);
        }
        
        ResultadoBusquedaDTO<Producto> resultado = new ResultadoBusquedaDTO<>();
        resultado.items = productos;
        
        ResultadoBusquedaDTO.Metadata metadata = new ResultadoBusquedaDTO.Metadata();
        metadata.total = total;
        metadata.pagina = pagina;
        metadata.limite = limite;
        metadata.totalPaginas = (int) totalPaginas;
        metadata.tiempoMs = System.currentTimeMillis() - startTime;
        metadata.query = filtros.query;
        metadata.sugerencias = sugerencias;
        metadata.facets = facets;
        
        resultado.metadata = metadata;
        
        return resultado;
    }
    
    // Sugerencias de búsqueda (autocompletado)
    public List<String> obtenerSugerencias(String termino) {
        // Buscar en índices de texto
        List<Producto> productos = find(Filters.text(termino)).page(0, 10).list();
        
        Set<String> sugerencias = new LinkedHashSet<>();
        
        for (Producto p : productos) {
            if (p.nombre != null && p.nombre.toLowerCase().contains(termino.toLowerCase())) {
                sugerencias.add(p.nombre);
            }
            if (p.categoria != null && p.categoria.toLowerCase().contains(termino.toLowerCase())) {
                sugerencias.add(p.categoria);
            }
            // Atributos comunes como marca
            if (p.atributos != null && p.atributos.containsKey("marca")) {
                String marca = p.atributos.get("marca").toString();
                if (marca.toLowerCase().contains(termino.toLowerCase())) {
                    sugerencias.add(marca);
                }
            }
        }
        
        return sugerencias.stream().limit(5).collect(Collectors.toList());
    }
    
    // Productos más populares (por reseñas o ventas)
    public List<Producto> findProductosPopulares(String categoria, int limite) {
        Document match = new Document();
        match.append("activo", true);
        if (categoria != null && !categoria.isEmpty()) {
            match.append("categoria", categoria);
        }
        
        // Aquí se puede usar un campo "popularidad" o join con reseñas
        // Por ahora ordenamos por fecha más reciente
        return mongoCollection()
                .find(match)
                .sort(Sorts.descending("fechaCreacion"))
                .limit(limite)
                .into(new ArrayList<>());
    }
    
    // Productos relacionados (basado en categoría y atributos)
    public List<Producto> findProductosRelacionados(String productoId, String categoria, 
                                                     Map<String, Object> atributos, int limite) {
        List<Bson> filtros = new ArrayList<>();
        filtros.add(Filters.eq("activo", true));
        filtros.add(Filters.eq("categoria", categoria));
        filtros.add(Filters.ne("_id", new org.bson.types.ObjectId(productoId)));
        
        // Buscar productos con atributos similares
        if (atributos != null && !atributos.isEmpty()) {
            List<Bson> attrFilters = new ArrayList<>();
            for (Map.Entry<String, Object> attr : atributos.entrySet()) {
                if (attr.getValue() != null) {
                    attrFilters.add(Filters.eq("atributos." + attr.getKey(), attr.getValue()));
                }
            }
            if (!attrFilters.isEmpty()) {
                filtros.add(Filters.or(attrFilters));
            }
        }
        
        return mongoCollection()
                .find(Filters.and(filtros))
                .limit(limite)
                .into(new ArrayList<>());
    }
    
    // Obtener facets (conteos por categoría, tienda, rangos de precio)
    private Map<String, ResultadoBusquedaDTO.FacetCount> obtenerFacets(Bson filtroBase) {
        Map<String, ResultadoBusquedaDTO.FacetCount> facets = new LinkedHashMap<>();
        
        // Facet por categoría
        List<Bson> pipeline = Arrays.asList(
            Aggregates.match(filtroBase),
            Aggregates.group("$categoria", Accumulators.sum("count", 1)),
            Aggregates.sort(Sorts.descending("count")),
            Aggregates.limit(10)
        );
        
        List<Document> resultados = mongoCollection().withDocumentClass(Document.class).aggregate(pipeline).into(new ArrayList<>());
        
        for (Document doc : resultados) {
            ResultadoBusquedaDTO.FacetCount facet = new ResultadoBusquedaDTO.FacetCount();
            facet.nombre = doc.getString("_id");
            facet.count = doc.getLong("count");
            facets.put("categoria_" + facet.nombre, facet);
        }
        
        return facets;
    }
    
    // Construir ordenamiento
    private Bson getOrdenamiento(String campo, String direccion) {
        String campoOrden;
        
        switch (campo) {
            case "nombre": campoOrden = "nombre"; break;
            case "precio": campoOrden = "precio"; break;
            case "popularidad": campoOrden = "popularidad"; break;
            case "fechaCreacion":
            default: campoOrden = "fechaCreacion"; break;
        }
        
        boolean ascendente = "asc".equalsIgnoreCase(direccion);
        return ascendente ? Sorts.ascending(campoOrden) : Sorts.descending(campoOrden);
    }
}