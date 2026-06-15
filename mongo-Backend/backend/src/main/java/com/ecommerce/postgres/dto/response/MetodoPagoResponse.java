package com.ecommerce.postgres.dto.response;

import java.util.UUID;

public class MetodoPagoResponse {
    private UUID id;
    private UUID usuarioId;
    private String tokenTarjeta;
    private String tipo;
    private String ultimosDigitos;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUsuarioId() { return usuarioId; }
    public void setUsuarioId(UUID usuarioId) { this.usuarioId = usuarioId; }

    public String getTokenTarjeta() { return tokenTarjeta; }
    public void setTokenTarjeta(String tokenTarjeta) { this.tokenTarjeta = tokenTarjeta; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getUltimosDigitos() { return ultimosDigitos; }
    public void setUltimosDigitos(String ultimosDigitos) { this.ultimosDigitos = ultimosDigitos; }
}
