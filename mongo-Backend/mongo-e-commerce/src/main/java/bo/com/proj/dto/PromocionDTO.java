package bo.com.proj.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class PromocionDTO {
    public String id;
    public String nombre;
    public String descripcion;
    public String codigo;
    public String tipo;
    public BigDecimal valor;
    public BigDecimal maximoDescuento;
    public BigDecimal montoMinimoCompra;
    public Integer cantidadMinimaItems;
    public List<String> categoriasAplican;
    public List<String> tiendasAplican;
    public List<String> productosAplican;
    public List<String> productosExcluidos;
    public Map<String, Object> reglas;
    public Integer usosMaximos;
    public Integer usosPorUsuario;
    public LocalDateTime fechaInicio;
    public LocalDateTime fechaFin;
    public List<String> usuariosEspecificos;
    public List<String> rolesPermitidos;
    public Boolean soloPrimeraCompra;
    public Boolean activo;
    public Integer prioridad;
    public Boolean apilable;
    public List<String> promocionesExcluyentes;
    public Boolean vigente;
    public Integer usosDisponibles;
}