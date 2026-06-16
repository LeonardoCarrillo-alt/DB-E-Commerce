package bo.com.proj.dto;

import java.math.BigDecimal;
import java.util.List;

public class CrearPedidoRequestDTO {
    public String usuarioId;
    public BigDecimal total;
    public String estado;
    public List<ItemPedidoDTO> items;

    public static class ItemPedidoDTO {
        public String productoId;
        public Integer cantidad;
        public BigDecimal precioUnitario;
    }
}
