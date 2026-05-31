package com.vemaybay.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "HANGVE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HangVe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaHangVe")
    private Integer maHangVe;

    @Column(name = "TenHangVe", nullable = false, unique = true, length = 50)
    private String tenHangVe;

    @Column(name = "HeSoGia", nullable = false)
    private BigDecimal heSoGia;

    @Column(name = "MoTa", length = 200)
    private String moTa;

    @Column(name = "IsActive", nullable = false)
    private Boolean isActive;
}
