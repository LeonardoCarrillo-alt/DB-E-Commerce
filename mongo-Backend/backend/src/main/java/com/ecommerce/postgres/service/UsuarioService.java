package com.ecommerce.postgres.service;

import com.ecommerce.postgres.entity.Tienda;
import com.ecommerce.postgres.entity.Usuario;
import com.ecommerce.postgres.entity.UsuarioRol;
import com.ecommerce.postgres.entity.UsuarioRolId;
import com.ecommerce.postgres.exception.BusinessException;
import com.ecommerce.postgres.exception.ResourceNotFoundException;
import com.ecommerce.postgres.repository.RolRepository;
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
    RolRepository rolRepository;

    @Inject
    EntityManager entityManager;

    public List<Usuario> listAll() {
        return usuarioRepository.listAll();
    }

    public Usuario findById(UUID id) {
        return entityManager.createQuery(
                        "select u from Usuario u " +
                                "left join fetch u.tienda t " +
                                "where u.id = :id", Usuario.class)
                .setParameter("id", id)
                .getResultStream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + id));
    }

    public Usuario findByEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + email));
    }

    public Usuario validarCredenciales(String email, String password) {
        Usuario usuario = entityManager.createQuery(
                        "select u from Usuario u " +
                                "left join fetch u.usuarioRoles ur " +
                                "left join fetch ur.rol r " +
                                "left join fetch u.tienda t " +
                                "where u.email = :email", Usuario.class)
                .setParameter("email", email)
                .getResultStream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Credenciales inválidas"));
        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new BusinessException("Usuario inactivo");
        }
        if (!org.mindrot.jbcrypt.BCrypt.checkpw(password, usuario.getPasswordHash())) {
            throw new BusinessException("Credenciales inválidas");
        }
        return usuario;
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
        // Hashear la contraseña antes de guardar
        if (usuario.getPasswordHash() != null) {
            usuario.setPasswordHash(org.mindrot.jbcrypt.BCrypt.hashpw(usuario.getPasswordHash(), org.mindrot.jbcrypt.BCrypt.gensalt(12)));
        }
        usuarioRepository.persist(usuario);
        entityManager.flush();
        assignDefaultClienteRole(usuario);
        return usuario;
    }

    private void assignDefaultClienteRole(Usuario usuario) {
        if (usuario.getUsuarioRoles() != null && !usuario.getUsuarioRoles().isEmpty()) {
            return;
        }

        var clienteRol = rolRepository.findByNombre("CLIENTE")
                .orElseThrow(() -> new ResourceNotFoundException("Rol CLIENTE no encontrado"));

        UsuarioRol usuarioRol = new UsuarioRol();
        usuarioRol.setUsuario(usuario);
        usuarioRol.setRol(clienteRol);
        usuarioRol.setActivo(true);
        usuarioRol.setId(new UsuarioRolId(usuario.getId(), clienteRol.getId()));

        entityManager.persist(usuarioRol);
        usuario.getUsuarioRoles().add(usuarioRol);
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
