package com.vemaybay.repository;

import com.vemaybay.entity.ChiTietHangVe;
import com.vemaybay.entity.ChiTietHangVeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietHangVeRepository extends JpaRepository<ChiTietHangVe, ChiTietHangVeId> {

    List<ChiTietHangVe> findByMaChuyenBay(Integer maChuyenBay);
}
