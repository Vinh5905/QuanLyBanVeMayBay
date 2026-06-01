package com.vemaybay.repository;

import com.vemaybay.entity.Ve;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VeRepository extends JpaRepository<Ve, Integer> {

    Optional<Ve> findByMaVeAndIsDeletedFalse(Integer maVe);

    List<Ve> findByMaKhachHangAndIsDeletedFalse(Integer maKhachHang);

    @Query("SELECT v FROM Ve v WHERE v.isDeleted = false " +
           "AND (:maKhachHang IS NULL OR v.maKhachHang = :maKhachHang) " +
           "AND (:maChuyenBay IS NULL OR v.maChuyenBay = :maChuyenBay) " +
           "AND (:trangThaiVe IS NULL OR v.trangThaiVe = :trangThaiVe)")
    Page<Ve> findWithFilters(
            @Param("maKhachHang") Integer maKhachHang,
            @Param("maChuyenBay") Integer maChuyenBay,
            @Param("trangThaiVe") String trangThaiVe,
            Pageable pageable);
}
