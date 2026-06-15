package com.ecommerce.postgres.service;

import com.ecommerce.postgres.entity.Tienda;
import com.ecommerce.postgres.entity.Usuario;
import com.ecommerce.postgres.exception.BusinessException;
import com.ecommerce.postgres.exception.ResourceNotFoundException;
import com.ecommerce.postgres.repository.TiendaRepository;
import com.ecommerce.postgres.repository.UsuarioRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class UsuarioService {

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    TiendaRepository tiendaRepository;

    @Inject
    EntityManager entityManager;

    public List<Usuario> listAll() {
        return usuarioRepository.listAll();
    }

    public Usuario findById(UUID id) {
        return entityManager.createQuery("select u from Usuario u where u.id = :id", Usuario.class)
                .setParameter("id", id)
                .getResultStream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + id));
    }

    public Usuario findByEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + email));
    }

    @Transactional
    public Usuario create(Usuario usuario) {
        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            throw new BusinessException("Ya existe un usuario con ese email");
        }
        if (usuario.getTienda() != null && usuario.getTienda().getId() != null) {
            Tienda tienda = entityManager.createQuery("select t from Tienda t where t.id = :id", Tienda.class)
                    .setParameter("id", usuario.getTienda().getId())
                    .getResultStream()
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Tienda no encontrada: " + usuario.getTienda().getId()));
            usuario.setTienda(tienda);
        }
        usuarioRepository.persist(usuario);
        return usuario;
    }

    @Transactional
    public Usuario update(UUID id, Usuario usuario) {
        Usuario existing = findById(id);
        if (usuarioRepository.findByEmail(usuario.getEmail())
                .filter(candidate -> !candidate.getId().equals(id))
                .isPresent()) {
            throw new BusinessException("Ya existe un usuario con ese email");
        }
        existing.setEmail(usuario.getEmail());
        existing.setNombre(usuario.getNombre());
        existing.setPasswordHash(usuario.getPasswordHash());
        existing.setActivo(usuario.getActivo());
        if (usuario.getTienda() != null && usuario.getTienda().getId() != null) {
            Tienda tienda = entityManager.createQuery("select t from Tienda t where t.id = :id", Tienda.class)
                    .setParameter("id", usuario.getTienda().getId())
                    .getResultStream()
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Tienda no encontrada: " + usuario.getTienda().getId()));
            existing.setTienda(tienda);
        }
        return existing;
    }

    @Transactional
    public void delete(UUID id) {
        Usuario usuario = findById(id);
        usuarioRepository.delete(usuario);
    }
}
