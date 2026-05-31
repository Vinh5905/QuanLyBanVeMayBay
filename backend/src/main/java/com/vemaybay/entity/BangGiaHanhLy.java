package com.vemaybay.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "BANGGIA_HANHLY")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BangGiaHanhLy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaBangGia")
    private Integer maBangGia;

    @Column(name = "TenGoi", nullable = false, length = 100)
    private String tenGoi;

    @Column(name = "TrongLuongToiDa", nullable = false)
    private BigDecimal trongLuongToiDa;

    @Column(name = "GiaMuaTruoc", nullable = false)
    private BigDecimal giaMuaTruoc;

    @Column(name = "GiaTaiSanBay", nullable = false)
    private BigDecimal giaTaiSanBay;

    @Column(name = "IsActive", nullable = false)
    private Boolean isActive = true;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt", nullable = false)
    private LocalDateTime updatedAt;
}
