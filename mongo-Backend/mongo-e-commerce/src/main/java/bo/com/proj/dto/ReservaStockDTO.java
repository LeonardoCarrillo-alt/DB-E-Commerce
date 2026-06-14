package bo.com.proj.dto;

import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ReservaStockDTO {
    @NotBlank(message = "carritoId es requerido")
    public String carritoId;
    
    @NotBlank(message = "usuarioId es requerido")
    public String usuarioId;
    
    public List<ItemReservaDTO> items;
    
    public static class ItemReservaDTO {
        @NotBlank(message = "productoId es requerido")
        public String productoId;
        
        public String variante;
        
        @NotNull
        @Min(value = 1, message = "Cantidad debe ser mayor a 0")
        public Integer cantidad;
    }
}