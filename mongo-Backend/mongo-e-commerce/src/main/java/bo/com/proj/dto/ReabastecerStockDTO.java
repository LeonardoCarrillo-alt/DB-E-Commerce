package bo.com.proj.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class ReabastecerStockDTO {
    @NotBlank(message = "productoId es requerido")
    public String productoId;
    
    public String variante;
    
    @Min(value = 1, message = "Cantidad debe ser mayor a 0")
    public Integer cantidad;
    
    public String motivo;
}