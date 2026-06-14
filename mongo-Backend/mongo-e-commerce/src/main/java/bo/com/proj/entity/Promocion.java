package bo.com.proj.entity;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@MongoEntity(collection = "promociones")
public class Promocion extends PanacheMongoEntity {
    
    // Información básica
    public String nombre;
    public String descripcion;
    public String codigo;                 // Código promocional único (ej: "DESC10")
    
    // Tipo de promoción
    public String tipo;                   // PORCENTAJE, MONTO_FIJO, ENVIO_GRATIS, 2X1, COMPRA_LLEVA
    
    // Valores de descuento
    public BigDecimal valor;              // 10 = 10%, o monto fijo en MONEDA_LOCAL
    public BigDecimal maximoDescuento;    // Tope máximo de descuento (opcional)
    
    // Condiciones de aplicación
    public BigDecimal montoMinimoCompra;   // Monto mínimo para aplicar
    public Integer cantidadMinimaItems;    // Cantidad mínima de items en carrito
    public List<String> categoriasAplican; // Categorías que entran en promoción
    public List<String> tiendasAplican;    // Tiendas específicas
    public List<String> productosAplican;  // IDs de productos específicos
    public List<String> productosExcluidos;// Productos excluidos de la promoción
    
    // Reglas específicas por tipo
    public Map<String, Object> reglas;     // JSON flexible para reglas complejas
    // Ejemplo 2x1: { "productoGratisId": "xxx", "maxAplicaciones": 3 }
    // Ejemplo COMPRA_LLEVA: { "productoLlevaId": "xxx", "cantidadLleva": 1, "porcentajeDescuento": 50 }
    
    // Límites de uso
    public Integer usosMaximos;            // Límite total de usos
    public Integer usosActuales = 0;       // Usos acumulados
    public Integer usosPorUsuario = 1;     // Máximo por usuario
    
    // Vigencia
    public LocalDateTime fechaInicio;
    public LocalDateTime fechaFin;
    
    // Segmentación de usuarios (opcional)
    public List<String> usuariosEspecificos; // UUIDs de usuarios permitidos
    public List<String> rolesPermitidos;     // ["VIP", "NUEVO", "REGULAR"]
    public Boolean soloPrimeraCompra = false;
    
    // Estado y prioridad
    public Boolean activo = true;
    public Integer prioridad = 0;          // Mayor prioridad se aplica primero
    
    // Stacking (combinación con otras promos)
    public Boolean apilable = false;       // Si se puede combinar con otras
    public List<String> promocionesExcluyentes; // IDs de promos que no combinan
    
    // Auditoría
    public LocalDateTime fechaCreacion = LocalDateTime.now();
    public String creadoPor;
    public LocalDateTime fechaActualizacion;
    
    // Métodos de ayuda
    public boolean estaVigente() {
        LocalDateTime ahora = LocalDateTime.now();
        return activo && 
               (fechaInicio == null || !ahora.isBefore(fechaInicio)) &&
               (fechaFin == null || !ahora.isAfter(fechaFin));
    }
    
    public boolean tieneUsosDisponibles() {
        return usosMaximos == null || usosActuales < usosMaximos;
    }
    
    public void incrementarUso() {
        if (usosActuales != null) {
            usosActuales++;
        }
    }
}