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
    @JsonProperty("email") // 👈 Asegura consistencia de mapeo
    private String email;

    @NotBlank
    @JsonProperty("password_hash") // 🚨 ESTE ES EL PASO CLAVE
    private String passwordHash;

    @NotBlank
    @Size(max = 100)
    @JsonProperty("nombre") // 👈 Asegura consistencia de mapeo
    private String nombre;

    @NotNull
    @JsonProperty("activo") // 👈 Asegura consistencia de mapeo
    private Boolean activo = true;

    @JsonProperty("tienda_id") // 👈 Asegura consistencia de mapeo
    private UUID tiendaId;

    // --- GETTERS Y SETTERS ---
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    @JsonProperty("password_hash") // 🚨 Forzamos la lectura en el Getter de Jackson
    public String getPasswordHash() { return passwordHash; }
    
    @JsonProperty("password_hash") // 🚨 Forzamos la escritura en el Setter de Jackson
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public UUID getTiendaId() { return tiendaId; }
    public void setTiendaId(UUID tiendaId) { this.tiendaId = tiendaId; }
}