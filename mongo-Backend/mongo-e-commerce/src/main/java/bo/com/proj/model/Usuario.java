package bo.com.proj.model;

import java.util.List;

// Este modelo representa los datos que vienen de PostgreSQL
// No es una entidad de MongoDB
public class Usuario {
    private String id;           // UUID de PostgreSQL
    private String email;
    private String nombre;
    private String rol;          // SUPER_ADMIN, ADMIN_TIENDA, VENDEDOR, CLIENTE
    private String tiendaId;     // UUID de la tienda (para admins/vendedores)
    private Boolean activo;
    private List<String> permisos;  // Lista de permisos desde JSONB de PostgreSQL
    
    // Constructor vacío
    public Usuario() {}
    
    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    
    public String getTiendaId() { return tiendaId; }
    public void setTiendaId(String tiendaId) { this.tiendaId = tiendaId; }
    
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    
    public List<String> getPermisos() { return permisos; }
    public void setPermisos(List<String> permisos) { this.permisos = permisos; }
}