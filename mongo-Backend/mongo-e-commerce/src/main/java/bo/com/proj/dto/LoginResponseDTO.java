package bo.com.proj.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LoginResponseDTO {
    public String token; // Para el frontend

    @JsonProperty("accessToken")
    public String accessToken; // Opcional, para compatibilidad

    @JsonProperty("refreshToken")
    public String refreshToken;

    @JsonProperty("tokenType")
    public String tokenType = "Bearer";

    @JsonProperty("expiresIn")
    public Long expiresIn = 3600L;

    public UserInfoDTO user;
    
    public static class UserInfoDTO {
        public String id;
        public String email;
        public String nombre;
        public String rol;

        @JsonProperty("tiendaId")
        public String tiendaId;
    }
}
