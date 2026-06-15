package com.ecommerce.postgres.repository;

import com.ecommerce.postgres.entity.Envio;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class EnvioRepository implements PanacheRepository<Envio> {

    public List<Envio> findByPedidoId(UUID pedidoId) {
        return list("pedido.id", pedidoId);
    }

    public List<Envio> findByEstado(String estado) {
        return list("estado", estado);
    }
}
