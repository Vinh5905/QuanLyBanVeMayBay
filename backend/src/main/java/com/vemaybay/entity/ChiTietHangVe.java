package com.vemaybay.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "CT_HANGVE")
@IdClass(ChiTietHangVeId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietHangVe {

    @Id
    @Column(name = "MaChuyenBay")
    private Integer maChuyenBay;

    @Id
    @Column(name = "MaHangVe")
    private Integer maHangVe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaChuyenBay", insertable = false, updatable = false)
    private ChuyenBay chuyenBay;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MaHangVe", insertable = false, updatable = false)
    private HangVe hangVe;

    @Column(name = "SoLuong", nullable = false)
    private Integer soLuong;

    @Column(name = "SoGheDaDat", nullable = false)
    private Integer soGheDaDat;

    @Column(name = "DonGia", nullable = false)
    private BigDecimal donGia;
}
