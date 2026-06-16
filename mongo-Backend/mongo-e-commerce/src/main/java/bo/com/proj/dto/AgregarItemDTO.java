package bo.com.proj.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class AgregarItemDTO {

    @NotBlank(message = "productoId es requerido")
    @JsonProperty("productoId")
    public String productoId;
    
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    public Integer cantidad = 1;
    
    public String variante; 
    
    public String usuarioId; 
    public String usuarioEmail;
    
}
