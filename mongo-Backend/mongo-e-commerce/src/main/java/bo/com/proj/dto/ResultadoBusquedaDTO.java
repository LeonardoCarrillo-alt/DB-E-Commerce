package bo.com.proj.dto;

import java.util.List;
import java.util.Map;

public class ResultadoBusquedaDTO<T> {
    public List<T> items;
    public Metadata metadata;
    
    public static class Metadata {
        public Long total;                   // Total de resultados
        public Integer pagina;               // Página actual
        public Integer limite;               // Items por página
        public Integer totalPaginas;         // Total de páginas
        public Long tiempoMs;                // Tiempo de respuesta en ms
        public String query;                 // Término de búsqueda
        public List<String> sugerencias;     // Sugerencias de búsqueda
        public Map<String, FacetCount> facets; // Conteos para filtros laterales
    }
    
    public static class FacetCount {
        public String nombre;
        public Long count;
    }
}