package com.ecommerce.postgres.entity;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
public class UsuarioRolId implements Serializable {

    private UUID usuarioId;
    private Long rolId;

    public UsuarioRolId() {
    }

    public UsuarioRolId(UUID usuarioId, Long rolId) {
        this.usuarioId = usuarioId;
        this.rolId = rolId;
    }

    public UUID getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(UUID usuarioId) {
        this.usuarioId = usuarioId;
    }

    public Long getRolId() {
        return rolId;
    }

    public void setRolId(Long rolId) {
        this.rolId = rolId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UsuarioRolId that)) return false;
        return java.util.Objects.equals(usuarioId, that.usuarioId) && java.util.Objects.equals(rolId, that.rolId);
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(usuarioId, rolId);
    }
}
