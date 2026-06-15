package com.ecommerce.postgres.repository;

import com.ecommerce.postgres.entity.Pedido;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class PedidoRepository implements PanacheRepository<Pedido> {

    public List<Pedido> findByUsuarioId(UUID usuarioId) {
        return list("usuario.id", usuarioId);
    }

    public List<Pedido> findByEstado(String estado) {
        return list("estado", estado);
    }
}
