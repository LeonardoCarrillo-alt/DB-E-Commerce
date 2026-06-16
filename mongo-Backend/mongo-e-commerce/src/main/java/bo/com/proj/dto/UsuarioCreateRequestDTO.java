package bo.com.proj.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UsuarioCreateRequestDTO {

    public String email;

    @JsonProperty("password_hash")
    public String passwordHash;

    public String nombre;
    public Boolean activo = true;
}
