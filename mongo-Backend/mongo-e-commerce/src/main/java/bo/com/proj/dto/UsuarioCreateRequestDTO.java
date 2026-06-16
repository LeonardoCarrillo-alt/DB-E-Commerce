package bo.com.proj.dto; // O el paquete que corresponda en tu Mongo

import com.fasterxml.jackson.annotation.JsonProperty;

public class UsuarioCreateRequestDTO {
    public String email;
    public String nombre;
    public boolean activo;

    @JsonProperty("password_hash") // 🚨 OBLIGA A MONGO A ENVIARLO ASÍ EXACTAMENTE
    public String passwordHash; 
}