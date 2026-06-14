package bo.com.proj.dto;

public class LoginResponseDTO {
    public String accessToken;
    public String refreshToken;
    public String tokenType = "Bearer";
    public Long expiresIn = 3600L;
    public UserInfoDTO user;
    
    public static class UserInfoDTO {
        public String id;
        public String email;
        public String nombre;
        public String rol;
        public String tiendaId;
    }
}