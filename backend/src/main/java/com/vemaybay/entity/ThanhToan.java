package com.vemaybay.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "THANHTOAN")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThanhToan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaThanhToan")
    private Integer maThanhToan;

    @Column(name = "MaVe")
    private Integer maVe;

    @Column(name = "MaPhieuDatCho")
    private Integer maPhieuDatCho;

    @Column(name = "LoaiThanhToan", nullable = false, length = 30)
    @Builder.Default
    private String loaiThanhToan = "TICKET";

    @Column(name = "SoTien", nullable = false)
    private BigDecimal soTien;

    @Column(name = "ThueVAT", nullable = false)
    private BigDecimal thueVAT;

    @Column(name = "PhuongThuc", nullable = false, length = 30)
    private String phuongThuc;

    @Column(name = "TrangThaiThanhToan", nullable = false, length = 30)
    private String trangThaiThanhToan;

    @Column(name = "MaGiaoDich", length = 100)
    private String maGiaoDich;

    @Column(name = "ThoiGianThanhToan")
    private LocalDateTime thoiGianThanhToan;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.loaiThanhToan == null || this.loaiThanhToan.isBlank()) this.loaiThanhToan = "TICKET";
        if (this.createdAt == null) this.createdAt = now;
        if (this.updatedAt == null) this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
