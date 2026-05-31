package com.vemaybay.entity;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ChiTietHangVeId implements Serializable {

    private Integer maChuyenBay;
    private Integer maHangVe;
}
