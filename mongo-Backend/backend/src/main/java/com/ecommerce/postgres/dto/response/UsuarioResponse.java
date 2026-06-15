package com.ecommerce.postgres.dto.response;

import java.time.Instant;
import java.util.UUID;

public class UsuarioResponse {
    private UUID id;
    private String email;
    private String nombre;
    private Boolean activo;
    private Instant fechaCreacion;
    private UUID tiendaId;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public Instant getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(Instant fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public UUID getTiendaId() { return tiendaId; }
    public void setTiendaId(UUID tiendaId) { this.tiendaId = tiendaId; }
}
