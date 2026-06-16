package bo.com.proj.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public class CreateOrderRequestDTO {
    @NotBlank(message = "reservaId es requerido")
    @JsonProperty("reservaId")
    public String reservaId;

    @NotBlank(message = "carritoId es requerido")
    @JsonProperty("carritoId")
    public String carritoId;

    @JsonProperty("direccionEnvio")
    public String direccionEnvio;

    @JsonProperty("metodoPago")
    public String metodoPago;
}
