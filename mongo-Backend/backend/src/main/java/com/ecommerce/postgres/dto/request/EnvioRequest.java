package com.ecommerce.postgres.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class EnvioRequest {

    @NotNull
    private UUID pedidoId;

    @NotBlank
    @Size(max = 100)
    private String transportista;

    @NotBlank
    @Size(max = 30)
    private String estado;

    public UUID getPedidoId() { return pedidoId; }
    public void setPedidoId(UUID pedidoId) { this.pedidoId = pedidoId; }

    public String getTransportista() { return transportista; }
    public void setTransportista(String transportista) { this.transportista = transportista; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
