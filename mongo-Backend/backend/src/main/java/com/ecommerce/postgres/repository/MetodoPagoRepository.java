package com.ecommerce.postgres.repository;

import com.ecommerce.postgres.entity.MetodoPago;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class MetodoPagoRepository implements PanacheRepository<MetodoPago> {

    public List<MetodoPago> findByUsuarioId(UUID usuarioId) {
        return list("usuario.id", usuarioId);
    }

    public List<MetodoPago> findByTipo(String tipo) {
        return list("tipo", tipo);
    }
}
