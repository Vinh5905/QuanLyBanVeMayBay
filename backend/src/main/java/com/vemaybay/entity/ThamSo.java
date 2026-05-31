package com.vemaybay.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "THAM_SO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThamSo {

    @Id
    @Column(name = "TenThamSo", length = 100)
    private String tenThamSo;

    @Column(name = "GiaTri", nullable = false, length = 500)
    private String giaTri;

    @Column(name = "MoTa", length = 200)
    private String moTa;

    @Column(name = "CapNhatBoi")
    private Integer capNhatBoi;

    @Column(name = "CapNhatLuc", nullable = false)
    private LocalDateTime capNhatLuc;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.capNhatLuc = LocalDateTime.now();
    }
}
