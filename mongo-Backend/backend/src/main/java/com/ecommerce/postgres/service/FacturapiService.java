package com.ecommerce.postgres.service;

import com.ecommerce.postgres.exception.BusinessException;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.awt.*;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@ApplicationScoped
public class FacturapiService {

    @ConfigProperty(name = "facturas.upload-dir")
    String uploadDir;

    @ConfigProperty(name = "quarkus.http.port")
    int serverPort;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter
            .ofPattern("yyyy-MM-dd'T'HH:mm:ss")
            .withZone(ZoneId.of("America/Mexico_City"));

    private static final DateTimeFormatter DATE_SHORT = DateTimeFormatter
            .ofPattern("dd/MM/yyyy")
            .withZone(ZoneId.of("America/Mexico_City"));

    public static class FacturapiResult {
        public String xmlUrl;
        public String pdfUrl;
    }

    public FacturapiResult generarFactura(String rfc, String razonSocial, String codigoPostal,
                                           String regimenFiscal, String pedidoId,
                                           java.util.List<ItemFactura> items) {
        try {
            String uuidTimbre = UUID.randomUUID().toString();
            String folio = "F" + (System.currentTimeMillis() % 100000);
            String fechaEmision = DATE_FMT.format(Instant.now());
            String fechaShort = DATE_SHORT.format(Instant.now());

            double subTotal = items.stream().mapToDouble(i -> i.cantidad * i.precio).sum();
            double iva = subTotal * 0.16;
            double total = subTotal + iva;

            Path dir = Path.of(uploadDir);
            Files.createDirectories(dir);

            Path xmlPath = dir.resolve(pedidoId + ".xml");
            Path pdfPath = dir.resolve(pedidoId + ".pdf");

            String baseUrl = "http://localhost:" + serverPort;

            generarXml(xmlPath, uuidTimbre, folio, fechaEmision, rfc, razonSocial,
                    codigoPostal, regimenFiscal, items, subTotal, iva, total);
            generarPdf(pdfPath, folio, fechaShort, uuidTimbre, rfc, razonSocial,
                    codigoPostal, regimenFiscal, items, subTotal, iva, total);

            FacturapiResult result = new FacturapiResult();
            result.xmlUrl = baseUrl + "/facturas/files/" + pedidoId + "/xml";
            result.pdfUrl = baseUrl + "/facturas/files/" + pedidoId + "/pdf";
            return result;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("Error al generar factura local: " + e.getMessage());
        }
    }

    private void generarXml(Path path, String uuid, String folio, String fecha,
                            String rfc, String razonSocial, String codigoPostal,
                            String regimenFiscal, java.util.List<ItemFactura> items,
                            double subTotal, double iva, double total) throws Exception {
        StringBuilder conceptosXml = new StringBuilder();
        for (ItemFactura item : items) {
            double importe = item.cantidad * item.precio;
            conceptosXml.append("""
                    <cfdi:Concepto ClaveProdServ="01010101" NoIdentificacion="%s" Cantidad="%d" ClaveUnidad="H87" Unidad="Pieza" Descripcion="%s" ValorUnitario="%.2f" Importe="%.2f" ObjetoImp="02">
                      <cfdi:Impuestos>
                        <cfdi:Traslados>
                          <cfdi:Traslado Base="%.2f" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="%.2f"/>
                        </cfdi:Traslados>
                      </cfdi:Impuestos>
                    </cfdi:Concepto>
                    """.formatted(item.sku, item.cantidad, escaparXml(item.descripcion),
                    item.precio, importe, importe, importe * 0.16));
        }

        String xml = """
                <?xml version="1.0" encoding="UTF-8"?>
                <cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd" Version="4.0" Serie="A" Folio="%s" Fecha="%s" FormaPago="XX" SubTotal="%.2f" Moneda="MXN" Total="%.2f" TipoDeComprobante="I" Exportacion="01" MetodoPago="XX" LugarExpedicion="%s">
                  <cfdi:Emisor Rfc="ECO220101000" Nombre="DBE Commerce" RegimenFiscal="601"/>
                  <cfdi:Receptor Rfc="%s" Nombre="%s" DomicilioFiscalReceptor="%s" RegimenFiscalReceptor="%s" UsoCFDI="G01"/>
                  <cfdi:Conceptos>
                %s
                  </cfdi:Conceptos>
                  <cfdi:Impuestos TotalImpuestosTrasladados="%.2f">
                    <cfdi:Traslados>
                      <cfdi:Traslado Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="%.2f"/>
                    </cfdi:Traslados>
                  </cfdi:Impuestos>
                  <cfdi:Complemento>
                    <tfd:TimbreFiscalDigital xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" xsi:schemaLocation="http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/cfd/TimbreFiscalDigital/TimbreFiscalDigitalv11.xsd" Version="1.1" UUID="%s" FechaTimbrado="%s" RfcProvCertif="ECO220101000" NoCertificadoSAT="00000000000000000000"/>
                  </cfdi:Complemento>
                </cfdi:Comprobante>
                """.formatted(folio, fecha, subTotal, total, codigoPostal,
                rfc, escaparXml(razonSocial), codigoPostal, regimenFiscal,
                conceptosXml, iva, iva, uuid, fecha);

        try (OutputStreamWriter writer = new OutputStreamWriter(
                new FileOutputStream(path.toFile()), StandardCharsets.UTF_8)) {
            writer.write(xml);
        }
    }

    private void generarPdf(Path path, String folio, String fecha, String uuid,
                            String rfc, String razonSocial, String codigoPostal,
                            String regimenFiscal,
                            java.util.List<ItemFactura> items,
                            double subTotal, double iva, double total) throws Exception {
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, new FileOutputStream(path.toFile()));
        document.open();

        Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD, new Color(0x1a, 0x23, 0x7e));
        Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.DARK_GRAY);
        Font normalFont = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.BLACK);
        Font boldFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.BLACK);
        Font totalFont = new Font(Font.HELVETICA, 14, Font.BOLD, new Color(0x1a, 0x23, 0x7e));

        Paragraph title = new Paragraph("FACTURA", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        document.add(new Paragraph(" "));
        document.add(new Paragraph("Folio: " + folio, boldFont));
        document.add(new Paragraph("Fecha: " + fecha, normalFont));
        document.add(new Paragraph("UUID: " + uuid, normalFont));
        document.add(new Paragraph(" "));

        document.add(new Paragraph("EMISOR", headerFont));
        document.add(new Paragraph("DBE Commerce", boldFont));
        document.add(new Paragraph("RFC: ECO220101000", normalFont));
        document.add(new Paragraph("Régimen: General de Ley Personas Morales", normalFont));
        document.add(new Paragraph(" "));

        document.add(new Paragraph("RECEPTOR", headerFont));
        document.add(new Paragraph(razonSocial, boldFont));
        document.add(new Paragraph("RFC: " + rfc, normalFont));
        document.add(new Paragraph("C.P.: " + codigoPostal, normalFont));
        document.add(new Paragraph("Régimen Fiscal: " + regimenFiscal, normalFont));
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(new float[]{0.5f, 3, 1, 1.5f, 1.5f});
        table.setWidthPercentage(100);
        String[] headers = {"#", "Descripción", "Cant.", "P/U", "Importe"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
            cell.setBackgroundColor(new Color(0xf0, 0xf0, 0xf0));
            cell.setPadding(5);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }

        for (int i = 0; i < items.size(); i++) {
            ItemFactura item = items.get(i);
            double importe = item.cantidad * item.precio;
            table.addCell(new PdfPCell(new Phrase(String.valueOf(i + 1), normalFont)));
            table.addCell(new PdfPCell(new Phrase(item.descripcion, normalFont)));
            table.addCell(new PdfPCell(new Phrase(String.valueOf(item.cantidad), normalFont)));
            table.addCell(new PdfPCell(new Phrase(String.format("%.2f", item.precio), normalFont)));
            PdfPCell importeCell = new PdfPCell(new Phrase(String.format("%.2f", importe), normalFont));
            importeCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            table.addCell(importeCell);
        }
        document.add(table);

        document.add(new Paragraph(" "));
        Paragraph subTotalP = new Paragraph("Subtotal:  $" + String.format("%.2f", subTotal), boldFont);
        subTotalP.setAlignment(Element.ALIGN_RIGHT);
        document.add(subTotalP);

        Paragraph ivaP = new Paragraph("IVA 16%:   $" + String.format("%.2f", iva), boldFont);
        ivaP.setAlignment(Element.ALIGN_RIGHT);
        document.add(ivaP);

        Paragraph totalP = new Paragraph("TOTAL:     $" + String.format("%.2f", total), totalFont);
        totalP.setAlignment(Element.ALIGN_RIGHT);
        document.add(totalP);

        document.add(new Paragraph(" "));
        document.add(new Paragraph("Este documento es una representación de prueba sin validez fiscal.", normalFont));

        document.close();
    }

    private static String escaparXml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;")
                .replace(">", "&gt;").replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    public static class ItemFactura {
        public String descripcion;
        public int cantidad;
        public double precio;
        public String sku;

        public ItemFactura(String descripcion, int cantidad, double precio, String sku) {
            this.descripcion = descripcion;
            this.cantidad = cantidad;
            this.precio = precio;
            this.sku = sku;
        }
    }
}
