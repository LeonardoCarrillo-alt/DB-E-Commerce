package bo.com.proj.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ResultadoPromocionDTO {
    public BigDecimal descuentoAplicado = BigDecimal.ZERO;
    public BigDecimal nuevoTotal = BigDecimal.ZERO;
    public List<PromocionAplicadaDTO> promocionesAplicadas = new ArrayList<>();
    public List<String> mensajes = new ArrayList<>();
    public List<String> errores = new ArrayList<>();
    
    public static class PromocionAplicadaDTO {
        public String promocionId;
        public String nombre;
        public String codigo;
        public String tipo;
        public BigDecimal descuento;
        public String detalle;
    }
}