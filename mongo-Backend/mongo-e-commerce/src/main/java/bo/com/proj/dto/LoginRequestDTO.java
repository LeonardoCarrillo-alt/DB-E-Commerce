package bo.com.proj.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequestDTO {
    @NotBlank(message = "Email es requerido")
    @Email(message = "Email inválido")
    public String email;
    
    @NotBlank(message = "Contraseña es requerida")
    public String password;
}