package bo.com.proj.resource;

import bo.com.proj.dto.LoginRequestDTO;
import bo.com.proj.dto.LoginResponseDTO;
import bo.com.proj.dto.RefreshTokenRequestDTO;
import bo.com.proj.service.AuthService;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.Map;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Autenticación", description = "Login, logout y refresh token")
@PermitAll
public class AuthResource {
    
    @Inject
    AuthService authService;
    
    @POST
    @Path("/login")
    @Operation(summary = "Iniciar sesión - Valida contra PostgreSQL")
    public Response login(@Valid LoginRequestDTO request) {
        LoginResponseDTO response = authService.login(request);
        return Response.ok(response).build();
    }
    
    @POST
    @Path("/refresh")
    @Operation(summary = "Refrescar token de acceso")
    public Response refresh(@Valid RefreshTokenRequestDTO request) {
        LoginResponseDTO response = authService.refreshToken(request);
        return Response.ok(response).build();
    }
    
    @POST
    @Path("/logout")
    @Operation(summary = "Cerrar sesión")
    public Response logout(@HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader) {
        String refreshToken = extractToken(authHeader);
        authService.logout(refreshToken);
        return Response.ok(Map.of("message", "Logout exitoso")).build();
    }
    
    @GET
    @Path("/me")
    @Operation(summary = "Obtener usuario actual desde JWT")
    public Response getCurrentUser() {
        var user = authService.getCurrentUser();
        if (user == null) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        return Response.ok(user).build();
    }
    
    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}