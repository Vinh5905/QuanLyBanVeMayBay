package com.vemaybay.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "SANBAY")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SanBay {

    @Id
    @Column(name = "MaSanBay", length = 10)
    private String maSanBay;

    @Column(name = "TenSanBay", nullable = false, length = 150)
    private String tenSanBay;

    @Column(name = "ThanhPho", nullable = false, length = 100)
    private String thanhPho;

    @Column(name = "QuocGia", nullable = false, length = 100)
    private String quocGia;

    @Column(name = "IsActive", nullable = false)
    private Boolean isActive;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.isActive == null) this.isActive = true;
    }
}
