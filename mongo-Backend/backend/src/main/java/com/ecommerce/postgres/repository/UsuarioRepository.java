package com.ecommerce.postgres.repository;

import com.ecommerce.postgres.entity.Usuario;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class UsuarioRepository implements PanacheRepository<Usuario> {

    public Optional<Usuario> findByEmail(String email) {
        return find("email", email).firstResultOptional();
    }

    public List<Usuario> findByTiendaId(UUID tiendaId) {
        return list("tienda.id", tiendaId);
    }

    public List<Usuario> findByActivo(Boolean activo) {
        return list("activo", activo);
    }
}
