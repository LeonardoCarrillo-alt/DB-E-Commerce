package bo.com.proj.dto;

import jakarta.validation.constraints.NotBlank;

public class AplicarPromocionDTO {
    @NotBlank(message = "codigoPromocion es requerido")
    public String codigoPromocion;
    
    public String usuarioId;
    public Boolean esPrimeraCompra = false;
    public String rolUsuario;
    public CalcularDescuentoDTO carrito;
}