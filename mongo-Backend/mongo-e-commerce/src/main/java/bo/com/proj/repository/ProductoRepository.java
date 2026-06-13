package bo.com.proj.repository;

import bo.com.proj.entity.Producto;
import io.quarkus.mongodb.panache.PanacheMongoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.bson.Document;
import java.util.List;

@ApplicationScoped
public class ProductoRepository implements PanacheMongoRepository<Producto> {

    public List<Producto> findByCategoria(String categoria) {
        return list("categoria", categoria);
    }

    public List<Producto> findByTienda(String tiendaId) {
        return list("tiendaId", tiendaId);
    }

    public List<Producto> findByPrecioRange(Double min, Double max) {
        return list("precio between ?1 and ?2", min, max);
    }

    // Búsqueda con operadores lógicos y atributos dinámicos
    public List<Producto> searchWithDynamicAttributes(Document filtros) {
        return find(filtros).list();
    }
}