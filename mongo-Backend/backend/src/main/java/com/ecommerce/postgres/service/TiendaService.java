package com.ecommerce.postgres.service;

import com.ecommerce.postgres.entity.Tienda;
import com.ecommerce.postgres.exception.BusinessException;
import com.ecommerce.postgres.exception.ResourceNotFoundException;
import com.ecommerce.postgres.repository.TiendaRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class TiendaService {

    @Inject
    TiendaRepository tiendaRepository;

    @Inject
    EntityManager entityManager;

    public List<Tienda> listAll() {
        return tiendaRepository.listAll();
    }

    public Tienda findById(UUID id) {
        return entityManager.createQuery("select t from Tienda t where t.id = :id", Tienda.class)
                .setParameter("id", id)
                .getResultStream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Tienda no encontrada: " + id));
    }

    @Transactional
    public Tienda create(Tienda tienda) {
        if (tiendaRepository.findByNombre(tienda.getNombre()).isPresent()) {
            throw new BusinessException("Ya existe una tienda con ese nombre");
        }
        tiendaRepository.persist(tienda);
        return tienda;
    }

    @Transactional
    public Tienda update(UUID id, Tienda tienda) {
        Tienda existing = findById(id);
        if (tiendaRepository.findByNombre(tienda.getNombre())
                .filter(candidate -> !candidate.getId().equals(id))
                .isPresent()) {
            throw new BusinessException("Ya existe una tienda con ese nombre");
        }
        existing.setNombre(tienda.getNombre());
        existing.setDescripcion(tienda.getDescripcion());
        existing.setActivo(tienda.getActivo());
        return existing;
    }

    @Transactional
    public void delete(UUID id) {
        Tienda tienda = findById(id);
        tiendaRepository.delete(tienda);
    }
}
