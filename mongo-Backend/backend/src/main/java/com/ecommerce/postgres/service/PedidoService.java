package com.ecommerce.postgres.service;

import com.ecommerce.postgres.entity.Pedido;
import com.ecommerce.postgres.entity.Usuario;
import com.ecommerce.postgres.exception.BusinessException;
import com.ecommerce.postgres.exception.ResourceNotFoundException;
import com.ecommerce.postgres.repository.PedidoRepository;
import com.ecommerce.postgres.repository.UsuarioRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.hibernate.Hibernate;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class PedidoService {

    @Inject
    PedidoRepository pedidoRepository;

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    EntityManager entityManager;

    public List<Pedido> listAll() {
        return pedidoRepository.listAll();
    }

    public Pedido findById(UUID id) {
        return entityManager.createQuery("select p from Pedido p where p.id = :id", Pedido.class)
                .setParameter("id", id)
                .getResultStream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado: " + id));
    }

    public List<Pedido> findByUsuarioId(UUID usuarioId) {
        return pedidoRepository.findByUsuarioId(usuarioId);
    }

    @Transactional
    public Pedido create(Pedido pedido) {
        if (pedido.getUsuario() == null || pedido.getUsuario().getId() == null) {
            throw new BusinessException("El pedido debe tener un usuario asociado");
        }
        Usuario usuario = entityManager.createQuery("select u from Usuario u where u.id = :id", Usuario.class)
                .setParameter("id", pedido.getUsuario().getId())
                .getResultStream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + pedido.getUsuario().getId()));
        pedido.setUsuario(usuario);
        if (pedido.getTotal() == null || pedido.getTotal().compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("El total del pedido no puede ser negativo");
        }
        if (pedido.getEstado() == null || pedido.getEstado().isBlank()) {
            throw new BusinessException("El estado del pedido es obligatorio");
        }
        pedidoRepository.persist(pedido);
        if (pedido.getDetalles() != null) {
            Hibernate.initialize(pedido.getDetalles());
        }
        return pedido;
    }

    @Transactional
    public Pedido update(UUID id, Pedido pedido) {
        Pedido existing = findById(id);
        if (pedido.getUsuario() != null && pedido.getUsuario().getId() != null) {
            Usuario usuario = entityManager.createQuery("select u from Usuario u where u.id = :id", Usuario.class)
                    .setParameter("id", pedido.getUsuario().getId())
                    .getResultStream()
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + pedido.getUsuario().getId()));
            existing.setUsuario(usuario);
        }
        if (pedido.getTotal() == null || pedido.getTotal().compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("El total del pedido no puede ser negativo");
        }
        if (pedido.getEstado() == null || pedido.getEstado().isBlank()) {
            throw new BusinessException("El estado del pedido es obligatorio");
        }
        existing.setEstado(pedido.getEstado());
        existing.setTotal(pedido.getTotal());
        if (existing.getDetalles() != null) {
            Hibernate.initialize(existing.getDetalles());
        }
        return existing;
    }

    @Transactional
    public void delete(UUID id) {
        Pedido pedido = findById(id);
        pedidoRepository.delete(pedido);
    }
}
