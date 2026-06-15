package com.ecommerce.postgres.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class MetodoPagoRequest {

    @NotNull
    private UUID usuarioId;

    @NotBlank
    private String tokenTarjeta;

    @NotBlank
    @Size(max = 50)
    private String tipo;

    @NotBlank
    @Size(max = 4)
    private String ultimosDigitos;

    public UUID getUsuarioId() { return usuarioId; }
    public void setUsuarioId(UUID usuarioId) { this.usuarioId = usuarioId; }

    public String getTokenTarjeta() { return tokenTarjeta; }
    public void setTokenTarjeta(String tokenTarjeta) { this.tokenTarjeta = tokenTarjeta; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getUltimosDigitos() { return ultimosDigitos; }
    public void setUltimosDigitos(String ultimosDigitos) { this.ultimosDigitos = ultimosDigitos; }
}
