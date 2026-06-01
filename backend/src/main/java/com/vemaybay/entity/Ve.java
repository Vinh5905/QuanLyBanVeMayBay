package com.vemaybay.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "VE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ve {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaVe")
    private Integer maVe;

    @Column(name = "MaVeCode", nullable = false, unique = true, length = 30)
    private String maVeCode;

    @Column(name = "MaChuyenBay", nullable = false)
    private Integer maChuyenBay;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaChuyenBay", insertable = false, updatable = false)
    private ChuyenBay chuyenBay;

    @Column(name = "MaHangVe", nullable = false)
    private Integer maHangVe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaHangVe", insertable = false, updatable = false)
    private HangVe hangVe;

    @Column(name = "MaKhachHang", nullable = false)
    private Integer maKhachHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaKhachHang", insertable = false, updatable = false)
    private KhachHang khachHang;

    @Column(name = "MaPhieuDatCho")
    private Integer maPhieuDatCho;

    @Column(name = "GiaVe", nullable = false)
    private BigDecimal giaVe;

    @Column(name = "TrangThaiVe", nullable = false, length = 30)
    private String trangThaiVe;

    @Column(name = "IsDeleted", nullable = false)
    private Boolean isDeleted = false;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.isDeleted == null) this.isDeleted = false;
        if (this.trangThaiVe == null) this.trangThaiVe = "HOP_LE";
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
