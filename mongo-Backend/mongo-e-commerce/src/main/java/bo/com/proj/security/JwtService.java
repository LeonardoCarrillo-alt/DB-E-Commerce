package bo.com.proj.security;

import bo.com.proj.model.Usuario;
import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@ApplicationScoped
public class JwtService {
    
    private static final String ISSUER = "https://bo.com.proj/ecommerce";
    
    /**
     * Genera token JWT a partir del usuario de PostgreSQL
     */
    public String generateToken(Usuario usuario) {
        Set<String> grupos = new HashSet<>();
        grupos.add(usuario.getRol());
        
        // Agregar roles derivados según el rol base
        switch (usuario.getRol()) {
            case "SUPER_ADMIN":
                grupos.add("ADMIN_TIENDA");
                grupos.add("VENDEDOR");
                grupos.add("CLIENTE");
                break;
            case "ADMIN_TIENDA":
                grupos.add("VENDEDOR");
                grupos.add("CLIENTE");
                break;
            case "VENDEDOR":
                grupos.add("CLIENTE");
                break;
        }
        
        // Agregar permisos individuales como grupos
        if (usuario.getPermisos() != null) {
            grupos.addAll(usuario.getPermisos());
        }
        
        var builder = Jwt.claims()
            .subject(usuario.getId())
            .upn(usuario.getEmail())
            .issuer(ISSUER)
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(3600))
            .claim("jti", UUID.randomUUID().toString())
            .claim("email", usuario.getEmail())
            .claim("nombre", usuario.getNombre())
            .claim("rol", usuario.getRol())
            .claim("groups", grupos);
        
        // Agregar tiendaId si es admin de tienda o vendedor
        if (usuario.getTiendaId() != null && !usuario.getTiendaId().isEmpty()) {
            builder.claim("tiendaId", usuario.getTiendaId());
        }
        
        return builder.sign();
    }
    
    /**
     * Genera refresh token
     */
    public String generateRefreshToken(Usuario usuario) {
        return Jwt.claims()
            .subject(usuario.getId())
            .upn(usuario.getEmail())
            .issuer(ISSUER)
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(86400)) // 24 horas
            .claim("jti", UUID.randomUUID().toString())
            .claim("tipo", "refresh")
            .sign();
    }
}