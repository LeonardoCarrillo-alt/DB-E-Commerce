package bo.com.proj.dto;

import jakarta.validation.constraints.NotBlank;

public class RefreshTokenRequestDTO {
    @NotBlank(message = "Refresh token es requerido")
    public String refreshToken;
}