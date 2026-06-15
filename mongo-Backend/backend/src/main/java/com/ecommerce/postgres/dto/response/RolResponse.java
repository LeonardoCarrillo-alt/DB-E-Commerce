package com.ecommerce.postgres.dto.response;

public class RolResponse {
    private Long id;
    private String nombre;
    private String permisos;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getPermisos() { return permisos; }
    public void setPermisos(String permisos) { this.permisos = permisos; }
}
