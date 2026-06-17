package com.ecommerce.postgres.resource;

import com.ecommerce.postgres.dto.request.FacturaRequest;
import com.ecommerce.postgres.dto.request.GenerarFacturaRequest;
import com.ecommerce.postgres.dto.response.FacturaResponse;
import com.ecommerce.postgres.mapper.DtoMapper;
import com.ecommerce.postgres.service.FacturaService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.RequestBody;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.io.File;
import java.net.URI;
import java.nio.file.Files;
import java.util.List;
import java.util.UUID;

@Path("/facturas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Facturas", description = "Gestión de facturas")
public class FacturaResource {

    @Inject
    FacturaService facturaService;

    @ConfigProperty(name = "facturas.upload-dir")
    String uploadDir;

    @GET
    @Operation(summary = "Listar facturas", description = "Obtiene todas las facturas registradas.")
    @APIResponse(responseCode = "200", description = "Listado de facturas", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = FacturaResponse.class)))
    public Response listAll() {
        List<FacturaResponse> response = facturaService.listAll().stream().map(DtoMapper::toResponse).toList();
        return Response.ok(response).build();
    }

    @GET
    @Path("{id}")
    @Operation(summary = "Obtener factura", description = "Recupera una factura por su identificador.")
    @APIResponse(responseCode = "200", description = "Factura encontrada", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = FacturaResponse.class)))
    @APIResponse(responseCode = "404", description = "Factura no encontrada")
    public Response findById(@PathParam("id") UUID id) {
        return Response.ok(DtoMapper.toResponse(facturaService.findById(id))).build();
    }

    @GET
    @Path("pedido/{pedidoId}")
    @Operation(summary = "Listar facturas por pedido", description = "Obtiene las facturas asociadas a un pedido.")
    @APIResponse(responseCode = "200", description = "Listado de facturas del pedido", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = FacturaResponse.class)))
    public Response findByPedidoId(@PathParam("pedidoId") UUID pedidoId) {
        return Response.ok(facturaService.findByPedidoId(pedidoId).stream().map(DtoMapper::toResponse).toList()).build();
    }

    @POST
    @Operation(summary = "Crear factura", description = "Crea una nueva factura.")
    @APIResponse(responseCode = "201", description = "Factura creada", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = FacturaResponse.class)))
    @APIResponse(responseCode = "400", description = "Datos inválidos")
    public Response create(@Valid @RequestBody(description = "Datos de la factura a crear", required = true, content = @Content(schema = @Schema(implementation = FacturaRequest.class))) FacturaRequest request) {
        var factura = facturaService.create(DtoMapper.toEntity(request));
        return Response.created(URI.create("/facturas/" + factura.getId())).entity(DtoMapper.toResponse(factura)).build();
    }

    @PUT
    @Path("{id}")
    @Operation(summary = "Actualizar factura", description = "Actualiza una factura existente.")
    @APIResponse(responseCode = "200", description = "Factura actualizada", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = FacturaResponse.class)))
    @APIResponse(responseCode = "400", description = "Datos inválidos")
    @APIResponse(responseCode = "404", description = "Factura no encontrada")
    public Response update(@PathParam("id") UUID id, @Valid @RequestBody(description = "Datos actualizados de la factura", required = true, content = @Content(schema = @Schema(implementation = FacturaRequest.class))) FacturaRequest request) {
        return Response.ok(DtoMapper.toResponse(facturaService.update(id, DtoMapper.toEntity(request)))).build();
    }

    @GET
    @Path("files/{pedidoId}/xml")
    @Operation(summary = "Descargar XML de factura", description = "Descarga el archivo XML del CFDI generado localmente.")
    @APIResponse(responseCode = "200", description = "Archivo XML")
    @APIResponse(responseCode = "404", description = "Archivo no encontrado")
    public Response descargarXml(@PathParam("pedidoId") String pedidoId) {
        File xmlFile = java.nio.file.Path.of(uploadDir, pedidoId + ".xml").toFile();
        if (!xmlFile.exists()) {
            return Response.status(404).build();
        }
        return Response.ok(xmlFile, "application/xml")
                .header("Content-Disposition", "attachment; filename=\"factura-" + pedidoId + ".xml\"")
                .build();
    }

    @GET
    @Path("files/{pedidoId}/pdf")
    @Operation(summary = "Descargar PDF de factura", description = "Descarga el archivo PDF de la factura generada localmente.")
    @APIResponse(responseCode = "200", description = "Archivo PDF")
    @APIResponse(responseCode = "404", description = "Archivo no encontrado")
    public Response descargarPdf(@PathParam("pedidoId") String pedidoId) {
        File pdfFile = java.nio.file.Path.of(uploadDir, pedidoId + ".pdf").toFile();
        if (!pdfFile.exists()) {
            return Response.status(404).build();
        }
        return Response.ok(pdfFile, "application/pdf")
                .header("Content-Disposition", "attachment; filename=\"factura-" + pedidoId + ".pdf\"")
                .build();
    }

    @POST
    @Path("generar")
    @Operation(summary = "Generar factura", description = "Genera automáticamente CFDI XML + PDF localmente usando los items del pedido.")
    @APIResponse(responseCode = "201", description = "Factura generada", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = FacturaResponse.class)))
    @APIResponse(responseCode = "400", description = "Datos inválidos o el pedido ya tiene factura")
    public Response generar(@Valid @RequestBody(description = "Datos para generar la factura", required = true, content = @Content(schema = @Schema(implementation = GenerarFacturaRequest.class))) GenerarFacturaRequest request) {
        var factura = facturaService.generarConFacturapi(request);
        return Response.created(URI.create("/facturas/" + factura.getId())).entity(DtoMapper.toResponse(factura)).build();
    }

    @DELETE
    @Path("{id}")
    @Operation(summary = "Eliminar factura", description = "Elimina una factura por su identificador.")
    @APIResponse(responseCode = "204", description = "Factura eliminada")
    @APIResponse(responseCode = "404", description = "Factura no encontrada")
    public Response delete(@PathParam("id") UUID id) {
        facturaService.delete(id);
        return Response.noContent().build();
    }
}
