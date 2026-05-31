package com.vemaybay.repository;

import com.vemaybay.entity.ThanhToan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThanhToanRepository extends JpaRepository<ThanhToan, Integer> {

    List<ThanhToan> findByMaVe(Integer maVe);

    List<ThanhToan> findByMaPhieuDatCho(Integer maPhieuDatCho);

    @Query("SELECT t FROM ThanhToan t " +
           "WHERE (:maVe IS NULL OR t.maVe = :maVe) " +
           "AND (:trangThai IS NULL OR t.trangThaiThanhToan = :trangThai)")
    Page<ThanhToan> findWithFilters(
            @Param("maVe") Integer maVe,
            @Param("trangThai") String trangThai,
            Pageable pageable);
}
