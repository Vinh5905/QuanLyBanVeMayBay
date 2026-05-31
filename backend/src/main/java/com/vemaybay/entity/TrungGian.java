package com.vemaybay.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TRUNGGIAN")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrungGian {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaTrungGian")
    private Integer maTrungGian;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaChuyenBay", nullable = false)
    private ChuyenBay chuyenBay;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MaSanBay", nullable = false)
    private SanBay sanBay;

    @Column(name = "ThuTu", nullable = false)
    private Integer thuTu;

    @Column(name = "ThoiGianDung", nullable = false)
    private Integer thoiGianDung;

    @Column(name = "GhiChu", length = 200)
    private String ghiChu;
}
