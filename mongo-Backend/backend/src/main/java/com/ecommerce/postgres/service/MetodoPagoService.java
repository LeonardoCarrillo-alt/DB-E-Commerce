package com.ecommerce.postgres.service;

import com.ecommerce.postgres.entity.MetodoPago;
import com.ecommerce.postgres.entity.Usuario;
import com.ecommerce.postgres.exception.BusinessException;
import com.ecommerce.postgres.exception.ResourceNotFoundException;
import com.ecommerce.postgres.repository.MetodoPagoRepository;
import com.ecommerce.postgres.repository.UsuarioRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class MetodoPagoService {

    @Inject
    MetodoPagoRepository metodoPagoRepository;

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    EntityManager entityManager;

    public List<MetodoPago> listAll() {
        return metodoPagoRepository.listAll();
    }

    public MetodoPago findById(UUID id) {
        return entityManager.createQuery("select m from MetodoPago m where m.id = :id", MetodoPago.class)
                .setParameter("id", id)
                .getResultStream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado: " + id));
    }

    public List<MetodoPago> findByUsuarioId(UUID usuarioId) {
        return metodoPagoRepository.findByUsuarioId(usuarioId);
    }

    @Transactional
    public MetodoPago create(MetodoPago metodoPago) {
        if (metodoPago.getUsuario() == null || metodoPago.getUsuario().getId() == null) {
            throw new BusinessException("El método de pago debe pertenecer a un usuario");
        }
        Usuario usuario = entityManager.createQuery("select u from Usuario u where u.id = :id", Usuario.class)
                .setParameter("id", metodoPago.getUsuario().getId())
                .getResultStream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + metodoPago.getUsuario().getId()));
        metodoPago.setUsuario(usuario);
        metodoPagoRepository.persist(metodoPago);
        return metodoPago;
    }

    @Transactional
    public MetodoPago update(UUID id, MetodoPago metodoPago) {
        MetodoPago existing = findById(id);
        existing.setTipo(metodoPago.getTipo());
        existing.setTokenTarjeta(metodoPago.getTokenTarjeta());
        existing.setUltimosDigitos(metodoPago.getUltimosDigitos());
        return existing;
    }

    @Transactional
    public void delete(UUID id) {
        MetodoPago metodoPago = findById(id);
        metodoPagoRepository.delete(metodoPago);
    }
}
