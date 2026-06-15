package com.ecommerce.postgres.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "direcciones")
public class Direccion extends PanacheEntityBase {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, foreignKey = @ForeignKey(name = "fk_direccion_usuario"))
    private Usuario usuario;

    @NotBlank
    @Column(nullable = false)
    private String calle;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String ciudad;

    @NotBlank
    @Size(max = 20)
    @Column(name = "codigo_postal", nullable = false, length = 20)
    private String codigoPostal;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    private String pais;

    public UUID getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getCalle() {
        return calle;
    }

    public void setCalle(String calle) {
        this.calle = calle;
    }

    public String getCiudad() {
        return ciudad;
    }

    public void setCiudad(String ciudad) {
        this.ciudad = ciudad;
    }

    public String getCodigoPostal() {
        return codigoPostal;
    }

    public void setCodigoPostal(String codigoPostal) {
        this.codigoPostal = codigoPostal;
    }

    public String getPais() {
        return pais;
    }

    public void setPais(String pais) {
        this.pais = pais;
    }
}
