package com.ecommerce.postgres.dto.response;

import java.util.UUID;

public class EnvioResponse {
    private UUID id;
    private UUID pedidoId;
    private String transportista;
    private String estado;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getPedidoId() { return pedidoId; }
    public void setPedidoId(UUID pedidoId) { this.pedidoId = pedidoId; }

    public String getTransportista() { return transportista; }
    public void setTransportista(String transportista) { this.transportista = transportista; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
