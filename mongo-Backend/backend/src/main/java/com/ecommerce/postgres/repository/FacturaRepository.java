package com.ecommerce.postgres.repository;

import com.ecommerce.postgres.entity.Factura;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class FacturaRepository implements PanacheRepository<Factura> {

    public List<Factura> findByPedidoId(UUID pedidoId) {
        return list("pedido.id", pedidoId);
    }

    public List<Factura> findByRfc(String rfc) {
        return list("rfc", rfc);
    }
}
