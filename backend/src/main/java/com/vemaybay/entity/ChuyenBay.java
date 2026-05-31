package com.vemaybay.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "CHUYENBAY")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChuyenBay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaChuyenBay")
    private Integer maChuyenBay;

    @Column(name = "MaChuyenBayCode", nullable = false, unique = true, length = 20)
    private String maChuyenBayCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "SanBayDi", nullable = false)
    private SanBay sanBayDi;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "SanBayDen", nullable = false)
    private SanBay sanBayDen;

    @Column(name = "NgayGioBay", nullable = false)
    private LocalDateTime ngayGioBay;

    @Column(name = "ThoiGianBay", nullable = false)
    private Integer thoiGianBay;

    @Column(name = "GiaCoBan", nullable = false)
    private BigDecimal giaCoBan;

    @Column(name = "TrangThaiChuyenBay", nullable = false, length = 30)
    private String trangThaiChuyenBay;

    @Column(name = "IsDeleted", nullable = false)
    private Boolean isDeleted;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "chuyenBay", fetch = FetchType.LAZY)
    private List<TrungGian> danhSachTrungGian;

    @OneToMany(mappedBy = "chuyenBay", fetch = FetchType.LAZY)
    private List<ChiTietHangVe> danhSachHangVe;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.isDeleted == null) this.isDeleted = false;
        if (this.trangThaiChuyenBay == null) this.trangThaiChuyenBay = "SCHEDULED";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
