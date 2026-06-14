package bo.com.proj.dto;

import java.util.List;

public class UsuarioResponseDTO {
    public String id;
    public String email;
    public String nombre;
    public String rol;
    public String tiendaId;
    public Boolean activo;
    public List<String> permisos;
}