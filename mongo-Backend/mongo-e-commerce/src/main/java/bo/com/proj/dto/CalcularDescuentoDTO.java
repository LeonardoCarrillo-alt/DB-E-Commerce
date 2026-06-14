package bo.com.proj.dto;

import java.math.BigDecimal;
import java.util.List;

public class CalcularDescuentoDTO {
    public String usuarioId;
    public String rolUsuario;
    public Boolean esPrimeraCompra;
    public BigDecimal subtotal;
    public Integer cantidadItems;
    public List<ItemCalculoDTO> items;
    
    public static class ItemCalculoDTO {
        public String productoId;
        public String categoria;
        public String tiendaId;
        public Integer cantidad;
        public BigDecimal precioUnitario;
        public BigDecimal subtotal;
    }
}