package com.ecommerce.postgres.service;

import com.ecommerce.postgres.entity.Direccion;
import com.ecommerce.postgres.entity.Usuario;
import com.ecommerce.postgres.exception.BusinessException;
import com.ecommerce.postgres.exception.ResourceNotFoundException;
import com.ecommerce.postgres.repository.DireccionRepository;
import com.ecommerce.postgres.repository.UsuarioRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class DireccionService {

    @Inject
    DireccionRepository direccionRepository;

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    EntityManager entityManager;

    public List<Direccion> listAll() {
        return direccionRepository.listAll();
    }

    public Direccion findById(UUID id) {
        return entityManager.createQuery("select d from Direccion d where d.id = :id", Direccion.class)
                .setParameter("id", id)
                .getResultStream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Dirección no encontrada: " + id));
    }

    public List<Direccion> findByUsuarioId(UUID usuarioId) {
        return direccionRepository.findByUsuarioId(usuarioId);
    }

    @Transactional
    public Direccion create(Direccion direccion) {
        if (direccion.getUsuario() == null || direccion.getUsuario().getId() == null) {
            throw new BusinessException("La dirección debe pertenecer a un usuario");
        }
        Usuario usuario = entityManager.createQuery("select u from Usuario u where u.id = :id", Usuario.class)
                .setParameter("id", direccion.getUsuario().getId())
                .getResultStream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + direccion.getUsuario().getId()));
        direccion.setUsuario(usuario);
        direccionRepository.persist(direccion);
        return direccion;
    }

    @Transactional
    public Direccion update(UUID id, Direccion direccion) {
        Direccion existing = findById(id);
        existing.setCalle(direccion.getCalle());
        existing.setCiudad(direccion.getCiudad());
        existing.setCodigoPostal(direccion.getCodigoPostal());
        existing.setPais(direccion.getPais());
        return existing;
    }

    @Transactional
    public void delete(UUID id) {
        Direccion direccion = findById(id);
        direccionRepository.delete(direccion);
    }
}
