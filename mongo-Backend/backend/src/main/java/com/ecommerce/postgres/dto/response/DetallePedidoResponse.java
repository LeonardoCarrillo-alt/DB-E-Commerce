package com.ecommerce.postgres.dto.response;

import java.math.BigDecimal;

public class DetallePedidoResponse {

    private String productoId;
    private Integer cantidad;
    private BigDecimal precioUnitario;

    public String getProductoId() { return productoId; }
    public void setProductoId(String productoId) { this.productoId = productoId; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }
}
