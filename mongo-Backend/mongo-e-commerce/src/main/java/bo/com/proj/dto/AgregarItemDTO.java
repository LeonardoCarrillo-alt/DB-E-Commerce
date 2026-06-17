package bo.com.proj.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import com.fasterxml.jackson.annotation.JsonProperty;

public class AgregarItemDTO {

    @NotBlank(message = "productoId es requerido")
    @JsonProperty("productoId") // 🚨 FORZAR NOMBRE EN EL JSON ENTRANTE
    public String productoId;
    
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    @JsonProperty("cantidad")
    public Integer cantidad = 1;
    
    @JsonProperty("variante")
    public String variante; 
    
    @JsonProperty("usuarioId")
    public String usuarioId; 
    
    @JsonProperty("usuarioEmail")
    public String usuarioEmail;
}
