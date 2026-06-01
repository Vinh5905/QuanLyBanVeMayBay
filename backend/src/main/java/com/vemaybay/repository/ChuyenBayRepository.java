package com.vemaybay.repository;

import com.vemaybay.entity.ChuyenBay;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface ChuyenBayRepository extends JpaRepository<ChuyenBay, Integer> {

    @Query("SELECT cb FROM ChuyenBay cb WHERE cb.isDeleted = false " +
            "AND (:sanBayDi IS NULL OR cb.sanBayDi.maSanBay = :sanBayDi) " +
            "AND (:sanBayDen IS NULL OR cb.sanBayDen.maSanBay = :sanBayDen) " +
            "AND (:trangThai IS NULL OR cb.trangThaiChuyenBay = :trangThai) " +
            "AND (:ngayBayFrom IS NULL OR cb.ngayGioBay >= :ngayBayFrom) " +
            "AND (:ngayBayTo IS NULL OR cb.ngayGioBay < :ngayBayTo)")
    Page<ChuyenBay> findWithFilters(
            @Param("sanBayDi") String sanBayDi,
            @Param("sanBayDen") String sanBayDen,
            @Param("trangThai") String trangThai,
            @Param("ngayBayFrom") LocalDateTime ngayBayFrom,
            @Param("ngayBayTo") LocalDateTime ngayBayTo,
            Pageable pageable);

    boolean existsByMaChuyenBayCode(String maChuyenBayCode);
}
