package com.ecommerce.postgres.service;

import com.ecommerce.postgres.entity.Factura;
import com.ecommerce.postgres.entity.Pedido;
import com.ecommerce.postgres.exception.BusinessException;
import com.ecommerce.postgres.exception.ResourceNotFoundException;
import com.ecommerce.postgres.repository.FacturaRepository;
import com.ecommerce.postgres.repository.PedidoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class FacturaService {

    @Inject
    FacturaRepository facturaRepository;

    @Inject
    PedidoRepository pedidoRepository;

    @Inject
    EntityManager entityManager;

    public List<Factura> listAll() {
        return facturaRepository.listAll();
    }

    public Factura findById(UUID id) {
        return entityManager.createQuery("select f from Factura f where f.id = :id", Factura.class)
                .setParameter("id", id)
                .getResultStream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Factura no encontrada: " + id));
    }

    public List<Factura> findByPedidoId(UUID pedidoId) {
        return facturaRepository.findByPedidoId(pedidoId);
    }

    @Transactional
    public Factura create(Factura factura) {
        if (factura.getPedido() == null || factura.getPedido().getId() == null) {
            throw new BusinessException("La factura debe estar asociada a un pedido");
        }
        Pedido pedido = entityManager.createQuery("select p from Pedido p where p.id = :id", Pedido.class)
                .setParameter("id", factura.getPedido().getId())
                .getResultStream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado: " + factura.getPedido().getId()));
        factura.setPedido(pedido);
        if (factura.getRfc() == null || factura.getRfc().isBlank()) {
            throw new BusinessException("El RFC de la factura es obligatorio");
        }
        facturaRepository.persist(factura);
        return factura;
    }

    @Transactional
    public Factura update(UUID id, Factura factura) {
        Factura existing = findById(id);
        if (factura.getPedido() != null && factura.getPedido().getId() != null) {
            Pedido pedido = entityManager.createQuery("select p from Pedido p where p.id = :id", Pedido.class)
                    .setParameter("id", factura.getPedido().getId())
                    .getResultStream()
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado: " + factura.getPedido().getId()));
            existing.setPedido(pedido);
        }
        if (factura.getRfc() == null || factura.getRfc().isBlank()) {
            throw new BusinessException("El RFC de la factura es obligatorio");
        }
        existing.setRfc(factura.getRfc());
        existing.setXmlUrl(factura.getXmlUrl());
        existing.setPdfUrl(factura.getPdfUrl());
        return existing;
    }

    @Transactional
    public void delete(UUID id) {
        Factura factura = findById(id);
        facturaRepository.delete(factura);
    }
}
