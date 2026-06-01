package com.vemaybay.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "KHACHHANG")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KhachHang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaKhachHang")
    private Integer maKhachHang;

    @Column(name = "HoTen", nullable = false, length = 150)
    private String hoTen;

    @Column(name = "CCCD", length = 20)
    private String cccd;

    @Column(name = "Email", length = 100)
    private String email;

    @Column(name = "SoDienThoai", length = 20)
    private String soDienThoai;

    @Column(name = "NgaySinh")
    private LocalDate ngaySinh;

    @Column(name = "MaHangThanhVien")
    private Integer maHangThanhVien;

    @Column(name = "DiemTichLuy", nullable = false)
    private Integer diemTichLuy = 0;

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
        if (this.diemTichLuy == null) this.diemTichLuy = 0;
        if (this.isDeleted == null) this.isDeleted = false;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
