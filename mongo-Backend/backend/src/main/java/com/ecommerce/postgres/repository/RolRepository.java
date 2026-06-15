package com.ecommerce.postgres.repository;

import com.ecommerce.postgres.entity.Rol;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class RolRepository implements PanacheRepository<Rol> {

    public Optional<Rol> findByNombre(String nombre) {
        return find("nombre", nombre).firstResultOptional();
    }

    public List<Rol> findByNombreContainingIgnoreCase(String nombre) {
        return list("lower(nombre) like lower(?1)", "%" + nombre + "%");
    }
}
