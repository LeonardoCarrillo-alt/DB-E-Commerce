package com.ecommerce.postgres.mapper;

import com.ecommerce.postgres.dto.request.*;
import com.ecommerce.postgres.dto.response.*;
import com.ecommerce.postgres.entity.*;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class DtoMapper {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private static List<String> parsePermisos(String permisosJson) {
        if (permisosJson == null || permisosJson.isBlank()) return Collections.emptyList();
        try {
            return OBJECT_MAPPER.readValue(permisosJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private static void setId(Object entity, Object id) {
        try {
            Field field = entity.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            throw new IllegalStateException("No se pudo asignar el id al entity", e);
        }
    }

    public static TiendaResponse toResponse(Tienda tienda) {
        TiendaResponse response = new TiendaResponse();
        response.setId(tienda.getId());
        response.setNombre(tienda.getNombre());
        response.setDescripcion(tienda.getDescripcion());
        response.setActivo(tienda.getActivo());
        return response;
    }

    public static Tienda toEntity(TiendaRequest request) {
        Tienda tienda = new Tienda();
        tienda.setNombre(request.getNombre());
        tienda.setDescripcion(request.getDescripcion());
        tienda.setActivo(request.getActivo());
        return tienda;
    }

    public static UsuarioResponse toResponse(Usuario usuario) {
        UsuarioResponse response = new UsuarioResponse();
        response.setId(usuario.getId());
        response.setEmail(usuario.getEmail());
        response.setNombre(usuario.getNombre());
        response.setActivo(usuario.getActivo());
        response.setFechaCreacion(usuario.getFechaCreacion());
        response.setTiendaId(usuario.getTienda() != null ? usuario.getTienda().getId() : null);
        if (usuario.getUsuarioRoles() != null && !usuario.getUsuarioRoles().isEmpty()) {
            UsuarioRol usuarioRol = usuario.getUsuarioRoles().stream()
                    .filter(ur -> Boolean.TRUE.equals(ur.getActivo()))
                    .findFirst().orElse(null);
            if (usuarioRol != null && usuarioRol.getRol() != null) {
                response.setRol(usuarioRol.getRol().getNombre());
                response.setPermisos(parsePermisos(usuarioRol.getRol().getPermisos()));
            }
        }
        return response;
    }

    public static Usuario toEntity(UsuarioRequest request) {
        Usuario usuario = new Usuario();
        usuario.setEmail(request.getEmail());
        usuario.setPasswordHash(request.getPasswordHash());
        usuario.setNombre(request.getNombre());
        usuario.setActivo(request.getActivo());
        if (request.getTiendaId() != null) {
            Tienda tienda = new Tienda();
            setId(tienda, request.getTiendaId());
            usuario.setTienda(tienda);
        }
        return usuario;
    }

    public static RolResponse toResponse(Rol rol) {
        RolResponse response = new RolResponse();
        response.setId(rol.getId());
        response.setNombre(rol.getNombre());
        response.setPermisos(rol.getPermisos());
        return response;
    }

    public static Rol toEntity(RolRequest request) {
        Rol rol = new Rol();
        rol.setNombre(request.getNombre());
        rol.setPermisos(request.getPermisos());
        return rol;
    }

    public static PedidoResponse toResponse(Pedido pedido) {
        PedidoResponse response = new PedidoResponse();
        response.setId(pedido.getId());
        response.setUsuarioId(pedido.getUsuario() != null ? pedido.getUsuario().getId() : null);
        response.setTotal(pedido.getTotal());
        response.setEstado(pedido.getEstado());
        response.setFechaCreacion(pedido.getFechaCreacion());
        response.setDireccionEnvio(pedido.getDireccionEnvio());
        if (pedido.getDetalles() != null) {
            response.setItems(pedido.getDetalles().stream().map(d -> {
                DetallePedidoResponse dr = new DetallePedidoResponse();
                dr.setProductoId(d.getProductoId());
                dr.setCantidad(d.getCantidad());
                dr.setPrecioUnitario(d.getPrecioUnitario());
                return dr;
            }).toList());
        }
        return response;
    }

    public static Pedido toEntity(PedidoRequest request) {
        Pedido pedido = new Pedido();
        Usuario usuario = new Usuario();
        setId(usuario, request.getUsuarioId());
        pedido.setUsuario(usuario);
        pedido.setTotal(request.getTotal());
        pedido.setEstado(request.getEstado());
        pedido.setDireccionEnvio(request.getDireccionEnvio());
        if (request.getItems() != null) {
            List<DetallePedido> detalles = new ArrayList<>();
            for (var item : request.getItems()) {
                DetallePedido detalle = new DetallePedido();
                detalle.setProductoId(item.getProductoId());
                detalle.setCantidad(item.getCantidad());
                detalle.setPrecioUnitario(item.getPrecioUnitario());
                detalle.setPedido(pedido);
                detalles.add(detalle);
            }
            pedido.setDetalles(detalles);
        }
        return pedido;
    }

    public static DireccionResponse toResponse(Direccion direccion) {
        DireccionResponse response = new DireccionResponse();
        response.setId(direccion.getId());
        response.setUsuarioId(direccion.getUsuario() != null ? direccion.getUsuario().getId() : null);
        response.setCalle(direccion.getCalle());
        response.setCiudad(direccion.getCiudad());
        response.setCodigoPostal(direccion.getCodigoPostal());
        response.setPais(direccion.getPais());
        return response;
    }

    public static Direccion toEntity(DireccionRequest request) {
        Direccion direccion = new Direccion();
        Usuario usuario = new Usuario();
        setId(usuario, request.getUsuarioId());
        direccion.setUsuario(usuario);
        direccion.setCalle(request.getCalle());
        direccion.setCiudad(request.getCiudad());
        direccion.setCodigoPostal(request.getCodigoPostal());
        direccion.setPais(request.getPais());
        return direccion;
    }

    public static MetodoPagoResponse toResponse(MetodoPago metodoPago) {
        MetodoPagoResponse response = new MetodoPagoResponse();
        response.setId(metodoPago.getId());
        response.setUsuarioId(metodoPago.getUsuario() != null ? metodoPago.getUsuario().getId() : null);
        response.setTokenTarjeta(metodoPago.getTokenTarjeta());
        response.setTipo(metodoPago.getTipo());
        response.setUltimosDigitos(metodoPago.getUltimosDigitos());
        return response;
    }

    public static MetodoPago toEntity(MetodoPagoRequest request) {
        MetodoPago metodoPago = new MetodoPago();
        Usuario usuario = new Usuario();
        setId(usuario, request.getUsuarioId());
        metodoPago.setUsuario(usuario);
        metodoPago.setTokenTarjeta(request.getTokenTarjeta());
        metodoPago.setTipo(request.getTipo());
        metodoPago.setUltimosDigitos(request.getUltimosDigitos());
        return metodoPago;
    }

    public static FacturaResponse toResponse(Factura factura) {
        FacturaResponse response = new FacturaResponse();
        response.setId(factura.getId());
        response.setPedidoId(factura.getPedido() != null ? factura.getPedido().getId() : null);
        response.setRfc(factura.getRfc());
        response.setXmlUrl(factura.getXmlUrl());
        response.setPdfUrl(factura.getPdfUrl());
        return response;
    }

    public static Factura toEntity(FacturaRequest request) {
        Factura factura = new Factura();
        Pedido pedido = new Pedido();
        setId(pedido, request.getPedidoId());
        factura.setPedido(pedido);
        factura.setRfc(request.getRfc());
        factura.setXmlUrl(request.getXmlUrl());
        factura.setPdfUrl(request.getPdfUrl());
        return factura;
    }

    public static EnvioResponse toResponse(Envio envio) {
        EnvioResponse response = new EnvioResponse();
        response.setId(envio.getId());
        response.setPedidoId(envio.getPedido() != null ? envio.getPedido().getId() : null);
        response.setTrackingNumber(envio.getTrackingNumber());
        response.setEstado(envio.getEstado());
        response.setProveedor(envio.getProveedor());
        return response;
    }

    public static Envio toEntity(EnvioRequest request) {
        Envio envio = new Envio();
        Pedido pedido = new Pedido();
        setId(pedido, request.getPedidoId());
        envio.setPedido(pedido);
        envio.setTrackingNumber(request.getTrackingNumber());
        envio.setEstado(request.getEstado());
        envio.setProveedor(request.getProveedor());
        return envio;
    }
}
