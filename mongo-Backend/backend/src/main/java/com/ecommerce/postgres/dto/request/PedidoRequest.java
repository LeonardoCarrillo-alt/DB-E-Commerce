package com.ecommerce.postgres.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class PedidoRequest {

    @NotNull
    private UUID usuarioId;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal total;

    @NotBlank
    private String estado;

    private List<DetallePedidoRequest> items;

    public UUID getUsuarioId() { return usuarioId; }
    public void setUsuarioId(UUID usuarioId) { this.usuarioId = usuarioId; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public List<DetallePedidoRequest> getItems() { return items; }
    public void setItems(List<DetallePedidoRequest> items) { this.items = items; }
}
