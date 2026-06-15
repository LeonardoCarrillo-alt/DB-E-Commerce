package com.ecommerce.postgres.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RolRequest {

    @NotBlank
    @Size(max = 50)
    private String nombre;

    private String permisos;

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getPermisos() { return permisos; }
    public void setPermisos(String permisos) { this.permisos = permisos; }
}
