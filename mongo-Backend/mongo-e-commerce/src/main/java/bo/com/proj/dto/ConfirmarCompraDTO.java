package bo.com.proj.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;

public class ConfirmarCompraDTO {
    @NotBlank(message = "reservaId es requerido")
    public String reservaId; 
    
    @NotBlank(message = "orderId es requerido")
    public String orderId;
    
    public List<ItemConfirmacionDTO> items;
    
    public static class ItemConfirmacionDTO {
        public String productoId;
        public String variante;
        public Integer cantidad;
    }
}