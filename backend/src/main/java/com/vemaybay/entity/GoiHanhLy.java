package com.vemaybay.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "GOIHANHLY")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoiHanhLy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaGoiHanhLy")
    private Integer maGoiHanhLy;

    @Column(name = "MaVe", nullable = false)
    private Integer maVe;

    @Column(name = "MaBangGia", nullable = false)
    private Integer maBangGia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaBangGia", insertable = false, updatable = false)
    private BangGiaHanhLy bangGia;

    @Column(name = "TongTrongLuong", nullable = false)
    private BigDecimal tongTrongLuong;

    @Column(name = "TongPhi", nullable = false)
    private BigDecimal tongPhi;

    @Column(name = "TrangThai", nullable = false, length = 30)
    private String trangThai = "REGISTERED";

    @Column(name = "DaThanhToan", nullable = false)
    @Builder.Default
    private Boolean daThanhToan = false;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "maGoiHanhLy", fetch = FetchType.LAZY)
    private List<KienHanhLy> danhSachKien;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.trangThai == null) this.trangThai = "REGISTERED";
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
