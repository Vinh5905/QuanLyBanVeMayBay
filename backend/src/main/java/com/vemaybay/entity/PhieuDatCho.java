package com.vemaybay.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "PHIEUDATCHO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhieuDatCho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaPhieuDatCho")
    private Integer maPhieuDatCho;

    @Column(name = "MaKhachHang", nullable = false)
    private Integer maKhachHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaKhachHang", insertable = false, updatable = false)
    private KhachHang khachHang;

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

    @Column(name = "SoLuongVe", nullable = false)
    private Integer soLuongVe = 1;

    @Column(name = "TongTien", nullable = false)
    private BigDecimal tongTien;

    @Column(name = "TrangThaiDatCho", nullable = false, length = 30)
    private String trangThaiDatCho;

    @Column(name = "HanThanhToan", nullable = false)
    private LocalDateTime hanThanhToan;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt", nullable = false)
    private LocalDateTime updatedAt;

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
