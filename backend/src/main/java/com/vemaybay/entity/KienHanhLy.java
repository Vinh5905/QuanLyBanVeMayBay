package com.vemaybay.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "KIENHANHLY")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KienHanhLy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaKienHanhLy")
    private Integer maKienHanhLy;

    @Column(name = "MaGoiHanhLy", nullable = false)
    private Integer maGoiHanhLy;

    @Column(name = "MaTheHanhLy", nullable = false, unique = true, length = 50)
    private String maTheHanhLy;

    @Column(name = "TrongLuong", nullable = false)
    private BigDecimal trongLuong;

    @Column(name = "GhiChu", length = 200)
    private String ghiChu;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
