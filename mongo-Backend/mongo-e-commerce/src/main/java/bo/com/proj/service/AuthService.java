package bo.com.proj.service;

import bo.com.proj.client.PostgreSQLClient;
import bo.com.proj.dto.LoginRequestDTO;
import bo.com.proj.dto.LoginResponseDTO;
import bo.com.proj.dto.RegisterRequestDTO;
import bo.com.proj.dto.RefreshTokenRequestDTO;
import bo.com.proj.dto.UsuarioCreateRequestDTO;
import bo.com.proj.dto.UsuarioResponseDTO;
import bo.com.proj.model.Usuario;
import bo.com.proj.security.JwtService;
import bo.com.proj.exception.ValidationException;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class AuthService {
    
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    
    @Inject
    @RestClient
    PostgreSQLClient postgresClient;
    
    @Inject
    JwtService jwtService;
    
    @Inject
    JsonWebToken jwt;
    
    @Inject
    SecurityIdentity securityIdentity;
    
    // Cache para refresh tokens (en producción usar Redis)
    private final Map<String, RefreshTokenData> refreshTokens = new ConcurrentHashMap<>();
    
    /**
     * Login - Valida contra PostgreSQL
     */
    public LoginResponseDTO login(LoginRequestDTO request) {
        // 1. Validar credenciales contra PostgreSQL
        UsuarioResponseDTO userResponse;
        try {
            userResponse = postgresClient.validarCredenciales(request.email, request.password);
        } catch (Exception e) {
            log.error("Error al validar credenciales en PostgreSQL: {}", e.getMessage());
            throw new ValidationException("Error de autenticación");
        }
        
        if (userResponse == null) {
            throw new ValidationException("Credenciales inválidas");
        }
        
        if (!userResponse.activo) {
            throw new ValidationException("Usuario inactivo. Contacte al administrador.");
        }
        
        // 2. Convertir a modelo local
        Usuario usuario = new Usuario();
        usuario.setId(userResponse.id);
        usuario.setEmail(userResponse.email);
        usuario.setNombre(userResponse.nombre);
        usuario.setRol(userResponse.rol);
        usuario.setTiendaId(userResponse.tiendaId);
        usuario.setActivo(userResponse.activo);
        usuario.setPermisos(userResponse.permisos);
        
        // 3. Generar tokens JWT
        String accessToken = jwtService.generateToken(usuario);
        String refreshToken = jwtService.generateRefreshToken(usuario);
        
        // 4. Guardar refresh token
        refreshTokens.put(refreshToken, new RefreshTokenData(
            usuario.getId(),
            usuario.getEmail(),
            usuario.getRol(),
            usuario.getTiendaId(),
            usuario.getNombre(),
            LocalDateTime.now().plusSeconds(86400)
        ));
        
        // 5. Construir respuesta
        LoginResponseDTO response = new LoginResponseDTO();
        response.token = accessToken; // Para el frontend
        response.accessToken = accessToken; // Para compatibilidad
        response.refreshToken = refreshToken;
        response.tokenType = "Bearer";
        response.expiresIn = 3600L;
        
        LoginResponseDTO.UserInfoDTO userInfo = new LoginResponseDTO.UserInfoDTO();
        userInfo.id = usuario.getId();
        userInfo.email = usuario.getEmail();
        userInfo.nombre = usuario.getNombre();
        userInfo.rol = usuario.getRol();
        userInfo.tiendaId = usuario.getTiendaId();
        response.user = userInfo;
        
        log.info("Usuario logueado: {} - {}", usuario.getEmail(), usuario.getRol());
        return response;
    }

    /**
     * Registro - PostgreSQL sigue siendo el source of truth de usuarios.
     */
    public LoginResponseDTO register(RegisterRequestDTO request) {
        UsuarioCreateRequestDTO createRequest = new UsuarioCreateRequestDTO();
        createRequest.email = request.email;
        createRequest.passwordHash = request.password;
        createRequest.nombre = request.nombre;
        createRequest.activo = true;

        try {
            postgresClient.createUsuario(createRequest);
        } catch (Exception e) {
            log.error("Error al registrar usuario en PostgreSQL: {}", e.getMessage());
            throw new ValidationException("No se pudo registrar el usuario");
        }

        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.email = request.email;
        loginRequest.password = request.password;
        return login(loginRequest);
    }
    
    /**
     * Refresh token
     */
    public LoginResponseDTO refreshToken(RefreshTokenRequestDTO request) {
        RefreshTokenData tokenData = refreshTokens.get(request.refreshToken);
        
        if (tokenData == null) {
            throw new ValidationException("Refresh token inválido");
        }
        
        if (tokenData.expira.isBefore(LocalDateTime.now())) {
            refreshTokens.remove(request.refreshToken);
            throw new ValidationException("Refresh token expirado");
        }
        
        // Obtener usuario actualizado desde PostgreSQL
        UsuarioResponseDTO userResponse = postgresClient.getUsuarioById(tokenData.usuarioId);
        if (userResponse == null || !userResponse.activo) {
            refreshTokens.remove(request.refreshToken);
            throw new ValidationException("Usuario no encontrado o inactivo");
        }
        
        Usuario usuario = new Usuario();
        usuario.setId(userResponse.id);
        usuario.setEmail(userResponse.email);
        usuario.setNombre(userResponse.nombre);
        usuario.setRol(userResponse.rol);
        usuario.setTiendaId(userResponse.tiendaId);
        usuario.setActivo(userResponse.activo);
        usuario.setPermisos(userResponse.permisos);
        
        // Generar nuevos tokens
        String newAccessToken = jwtService.generateToken(usuario);
        String newRefreshToken = jwtService.generateRefreshToken(usuario);
        
        // Refresh token rotation: eliminar old, guardar new
        refreshTokens.remove(request.refreshToken);
        refreshTokens.put(newRefreshToken, new RefreshTokenData(
            usuario.getId(),
            usuario.getEmail(),
            usuario.getRol(),
            usuario.getTiendaId(),
            usuario.getNombre(),
            LocalDateTime.now().plusSeconds(86400)
        ));
        
        LoginResponseDTO response = new LoginResponseDTO();
        response.token = newAccessToken; // Para el frontend
        response.accessToken = newAccessToken; // Para compatibilidad
        response.refreshToken = newRefreshToken;
        response.tokenType = "Bearer";
        response.expiresIn = 3600L;
        
        return response;
    }
    
    /**
     * Logout
     */
    public void logout(String refreshToken) {
        if (refreshToken != null) {
            refreshTokens.remove(refreshToken);
            log.info("Usuario cerró sesión");
        }
    }
    
    /**
     * Obtener usuario actual del token JWT
     * (Los datos ya están en el token, no consulta PostgreSQL)
     */
    public Usuario getCurrentUser() {
        if (securityIdentity == null || securityIdentity.getPrincipal() == null) {
            return null;
        }
        
        String userId = jwt.getSubject();
        String email = jwt.getClaim("email");
        String rol = jwt.getClaim("rol");
        String tiendaId = jwt.getClaim("tiendaId");
        String nombre = jwt.getClaim("nombre");
        
        Usuario usuario = new Usuario();
        usuario.setId(userId);
        usuario.setEmail(email);
        usuario.setNombre(nombre);
        usuario.setRol(rol);
        usuario.setTiendaId(tiendaId);
        usuario.setActivo(true);
        
        return usuario;
    }
    
    /**
     * Verificar rol del usuario actual
     */
    public boolean hasRole(String rol) {
        return securityIdentity != null && securityIdentity.hasRole(rol);
    }
    
    /**
     * Verificar acceso a tienda
     */
    public boolean canAccessTienda(String tiendaId) {
        Usuario usuario = getCurrentUser();
        if (usuario == null) return false;
        
        // SUPER_ADMIN tiene acceso a todas
        if ("SUPER_ADMIN".equals(usuario.getRol())) return true;
        
        // ADMIN_TIENDA y VENDEDOR solo a su tienda
        return usuario.getTiendaId() != null && usuario.getTiendaId().equals(tiendaId);
    }
    
    /**
     * Verificar permiso específico (desde JSONB de PostgreSQL)
     */
    public boolean hasPermission(String permiso) {
        Usuario usuario = getCurrentUser();
        if (usuario == null) return false;
        
        if ("SUPER_ADMIN".equals(usuario.getRol())) return true;
        
        return usuario.getPermisos() != null && usuario.getPermisos().contains(permiso);
    }
    
    // Clase interna para refresh tokens
    private static class RefreshTokenData {
        String usuarioId;
        String email;
        String rol;
        String tiendaId;
        String nombre;
        LocalDateTime expira;
        
        RefreshTokenData(String usuarioId, String email, String rol, 
                         String tiendaId, String nombre, LocalDateTime expira) {
            this.usuarioId = usuarioId;
            this.email = email;
            this.rol = rol;
            this.tiendaId = tiendaId;
            this.nombre = nombre;
            this.expira = expira;
        }
    }
}
