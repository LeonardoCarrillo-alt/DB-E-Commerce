package bo.com.proj.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UsuarioCreateRequestDTO {
    public String email;

    @JsonProperty("passwordHash")
    public String passwordHash;

    public String nombre;
    public Boolean activo = true;

    @JsonProperty("tiendaId")
    public String tiendaId;
}
