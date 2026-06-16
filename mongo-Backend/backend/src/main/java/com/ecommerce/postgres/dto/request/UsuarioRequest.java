package com.ecommerce.postgres.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public class UsuarioRequest {

    @Email
    @NotBlank
    @Size(max = 100)
    private String email;

    @NotBlank
    private String passwordHash;

    @NotBlank
    @Size(max = 100)
    private String nombre;

    @NotNull
    private Boolean activo = true;

    @JsonProperty("tienda_id")
    private UUID tiendaId;

    // --- GETTERS Y SETTERS ---
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public UUID getTiendaId() { return tiendaId; }
    public void setTiendaId(UUID tiendaId) { this.tiendaId = tiendaId; }
}