package com.ecommerce.postgres.repository;

import com.ecommerce.postgres.entity.Direccion;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class DireccionRepository implements PanacheRepository<Direccion> {

    public List<Direccion> findByUsuarioId(UUID usuarioId) {
        return list("usuario.id", usuarioId);
    }

    public List<Direccion> findByCiudad(String ciudad) {
        return list("ciudad", ciudad);
    }
}
