package com.ecommerce.postgres.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "envios")
public class Envio extends PanacheEntityBase {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false, unique = true, foreignKey = @ForeignKey(name = "fk_envio_pedido"))
    private Pedido pedido;

    @NotBlank
    @Size(max = 100)
    @Column(name = "tracking_number", nullable = false, length = 100)
    private String trackingNumber;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    private String estado;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String proveedor;

    public UUID getId() {
        return id;
    }

    public Pedido getPedido() {
        return pedido;
    }

    public void setPedido(Pedido pedido) {
        this.pedido = pedido;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getProveedor() {
        return proveedor;
    }

    public void setProveedor(String proveedor) {
        this.proveedor = proveedor;
    }
}
