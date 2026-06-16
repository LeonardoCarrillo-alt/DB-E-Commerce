package bo.com.proj.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class ActualizarItemDTO {

    @NotBlank(message = "productoId es requerido")
    public String productoId;
    
    @Min(value = 0, message = "La cantidad debe ser 0 o mayor")
    public Integer cantidad;
    
    public String variante;
    
}
