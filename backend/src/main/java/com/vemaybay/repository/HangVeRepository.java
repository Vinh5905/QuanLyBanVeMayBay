package com.vemaybay.repository;

import com.vemaybay.entity.HangVe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HangVeRepository extends JpaRepository<HangVe, Integer> {

    List<HangVe> findByIsActiveTrueOrderByHeSoGiaAscMaHangVeAsc();
}
