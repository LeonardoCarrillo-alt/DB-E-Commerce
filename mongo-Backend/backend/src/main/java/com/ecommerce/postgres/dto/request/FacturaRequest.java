package com.ecommerce.postgres.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class FacturaRequest {

    @NotNull
    private UUID pedidoId;

    @NotBlank
    @Size(max = 20)
    private String rfc;

    private String xmlUrl;

    private String pdfUrl;

    public UUID getPedidoId() { return pedidoId; }
    public void setPedidoId(UUID pedidoId) { this.pedidoId = pedidoId; }

    public String getRfc() { return rfc; }
    public void setRfc(String rfc) { this.rfc = rfc; }

    public String getXmlUrl() { return xmlUrl; }
    public void setXmlUrl(String xmlUrl) { this.xmlUrl = xmlUrl; }

    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; }
}
