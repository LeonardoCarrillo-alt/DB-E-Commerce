package com.ecommerce.postgres.service;

import com.ecommerce.postgres.entity.Envio;
import com.ecommerce.postgres.entity.Pedido;
import com.ecommerce.postgres.exception.BusinessException;
import com.ecommerce.postgres.exception.ResourceNotFoundException;
import com.ecommerce.postgres.repository.EnvioRepository;
import com.ecommerce.postgres.repository.PedidoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class EnvioService {

    @Inject
    EnvioRepository envioRepository;

    @Inject
    PedidoRepository pedidoRepository;

    @Inject
    EntityManager entityManager;

    public List<Envio> listAll() {
        return envioRepository.listAll();
    }

    public Envio findById(UUID id) {
        return entityManager.createQuery("select e from Envio e where e.id = :id", Envio.class)
                .setParameter("id", id)
                .getResultStream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Envío no encontrado: " + id));
    }

    public List<Envio> findByPedidoId(UUID pedidoId) {
        return envioRepository.findByPedidoId(pedidoId);
    }

    @Transactional
    public Envio create(Envio envio) {
        if (envio.getPedido() == null || envio.getPedido().getId() == null) {
            throw new BusinessException("El envío debe estar asociado a un pedido");
        }
        Pedido pedido = entityManager.createQuery("select p from Pedido p where p.id = :id", Pedido.class)
                .setParameter("id", envio.getPedido().getId())
                .getResultStream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado: " + envio.getPedido().getId()));
        envio.setPedido(pedido);
        if (envio.getTrackingNumber() == null || envio.getTrackingNumber().isBlank()) {
            throw new BusinessException("El número de tracking es obligatorio");
        }
        envioRepository.persist(envio);
        return envio;
    }

    @Transactional
    public Envio update(UUID id, Envio envio) {
        Envio existing = findById(id);
        existing.setEstado(envio.getEstado());
        existing.setProveedor(envio.getProveedor());
        existing.setTrackingNumber(envio.getTrackingNumber());
        return existing;
    }

    @Transactional
    public void delete(UUID id) {
        Envio envio = findById(id);
        envioRepository.delete(envio);
    }
}
