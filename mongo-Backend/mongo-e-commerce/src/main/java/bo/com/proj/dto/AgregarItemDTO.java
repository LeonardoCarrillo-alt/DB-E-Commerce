package bo.com.proj.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AgregarItemDTO {

    @NotBlank(message = "productoId es requerido")
    public String productoId;
    
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    public Integer cantidad = 1;
    
    public String variante; 
    
    public String usuarioId; 
    public String usuarioEmail;
    
}
