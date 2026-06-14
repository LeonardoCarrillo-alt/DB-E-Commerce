package bo.com.proj.repository;

import bo.com.proj.entity.HistorialBusqueda;
import io.quarkus.mongodb.panache.PanacheMongoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.bson.Document;
import org.bson.conversions.Bson;
import com.mongodb.client.model.Aggregates;
import com.mongodb.client.model.Accumulators;
import io.quarkus.panache.common.Sort;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Arrays;

@ApplicationScoped
public class HistorialBusquedaRepository implements PanacheMongoRepository<HistorialBusqueda> {
    
    // Búsquedas populares (más repetidas)
    public List<String> findBusquedasPopulares(String termino, int limite) {
        List<Bson> pipeline = Arrays.asList(
            Aggregates.match(
                new Document("termino", new Document("$regex", termino).append("$options", "i"))
            ),
            Aggregates.group("$termino", Accumulators.sum("count", 1)),
            Aggregates.sort(new Document("count", -1)),
            Aggregates.limit(limite)
        );
        
        List<Document> resultados = mongoCollection().withDocumentClass(Document.class).aggregate(pipeline).into(new ArrayList<>());
        List<String> busquedas = new ArrayList<>();
        
        for (Document doc : resultados) {
            busquedas.add(doc.getString("_id"));
        }
        
        return busquedas;
    }
    
    // Historial de búsquedas de un usuario
    public List<HistorialBusqueda> findHistorialByUsuario(String usuarioId, int limite) {
        return find("usuarioId", Sort.descending("fecha"), usuarioId)
                .page(0, limite)
                .list();
    }
    
    // Limpiar búsquedas antiguas (más de 30 días)
    public long limpiarBusquedasAntiguas() {
        LocalDateTime fechaLimite = LocalDateTime.now().minusDays(30);
        return delete("fecha < ?1", fechaLimite);
    }
}