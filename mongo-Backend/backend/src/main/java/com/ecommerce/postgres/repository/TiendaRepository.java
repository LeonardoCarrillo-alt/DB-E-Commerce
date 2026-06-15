package com.ecommerce.postgres.repository;

import com.ecommerce.postgres.entity.Tienda;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class TiendaRepository implements PanacheRepository<Tienda> {

    public Optional<Tienda> findByNombre(String nombre) {
        return find("nombre", nombre).firstResultOptional();
    }

    public List<Tienda> findByActivo(Boolean activo) {
        return list("activo", activo);
    }
}
