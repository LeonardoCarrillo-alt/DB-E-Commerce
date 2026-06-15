package com.ecommerce.postgres.service;

import com.ecommerce.postgres.entity.Rol;
import com.ecommerce.postgres.exception.BusinessException;
import com.ecommerce.postgres.exception.ResourceNotFoundException;
import com.ecommerce.postgres.repository.RolRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class RolService {

    @Inject
    RolRepository rolRepository;

    @Inject
    EntityManager entityManager;

    public List<Rol> listAll() {
        return rolRepository.listAll();
    }

    public Rol findById(Long id) {
        return entityManager.createQuery("select r from Rol r where r.id = :id", Rol.class)
                .setParameter("id", id)
                .getResultStream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado: " + id));
    }

    @Transactional
    public Rol create(Rol rol) {
        if (rolRepository.findByNombre(rol.getNombre()).isPresent()) {
            throw new BusinessException("Ya existe un rol con ese nombre");
        }
        rolRepository.persist(rol);
        return rol;
    }

    @Transactional
    public Rol update(Long id, Rol rol) {
        Rol existing = findById(id);
        existing.setNombre(rol.getNombre());
        existing.setPermisos(rol.getPermisos());
        return existing;
    }

    @Transactional
    public void delete(Long id) {
        Rol rol = findById(id);
        rolRepository.delete(rol);
    }
}
