package com.vemaybay.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "CHECKIN")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckIn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaCheckIn")
    private Integer maCheckIn;

    @Column(name = "MaVe", nullable = false, unique = true)
    private Integer maVe;

    @Column(name = "SoGhe", nullable = false, length = 10)
    private String soGhe;

    @Column(name = "BoardingPassCode", nullable = false, unique = true, length = 100)
    private String boardingPassCode;

    @Column(name = "CheckInAt", nullable = false)
    private LocalDateTime checkInAt;

    @Column(name = "TrangThai", nullable = false, length = 30)
    private String trangThai = "CHECKED_IN";

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
