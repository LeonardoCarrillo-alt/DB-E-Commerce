package com.ecommerce.postgres.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class PedidoResponse {
    private UUID id;
    private UUID usuarioId;
    private BigDecimal total;
    private String estado;
    private Instant fechaCreacion;
    private List<DetallePedidoResponse> items;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUsuarioId() { return usuarioId; }
    public void setUsuarioId(UUID usuarioId) { this.usuarioId = usuarioId; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Instant getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(Instant fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public List<DetallePedidoResponse> getItems() { return items; }
    public void setItems(List<DetallePedidoResponse> items) { this.items = items; }
}
