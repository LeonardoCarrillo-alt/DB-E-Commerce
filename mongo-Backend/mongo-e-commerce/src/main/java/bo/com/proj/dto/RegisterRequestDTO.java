package bo.com.proj.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class RegisterRequestDTO {
    @NotBlank(message = "Nombre es requerido")
    public String nombre;

    @NotBlank(message = "Email es requerido")
    @Email(message = "Email invalido")
    public String email;

    @NotBlank(message = "Contrasena es requerida")
    public String password;

    public String telefono;
}
