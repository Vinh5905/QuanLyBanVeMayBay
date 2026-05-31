package com.vemaybay.repository;

import com.vemaybay.entity.PhieuDatCho;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PhieuDatChoRepository extends JpaRepository<PhieuDatCho, Integer> {

    Optional<PhieuDatCho> findByMaPhieuDatChoAndTrangThaiDatChoNot(Integer maPhieuDatCho, String trangThai);

    List<PhieuDatCho> findByMaKhachHangAndTrangThaiDatChoNot(Integer maKhachHang, String trangThai);

    @Query("SELECT p FROM PhieuDatCho p " +
           "WHERE (:maKhachHang IS NULL OR p.maKhachHang = :maKhachHang) " +
           "AND (:maChuyenBay IS NULL OR p.maChuyenBay = :maChuyenBay) " +
           "AND (:trangThai IS NULL OR p.trangThaiDatCho = :trangThai)")
    Page<PhieuDatCho> findWithFilters(
            @Param("maKhachHang") Integer maKhachHang,
            @Param("maChuyenBay") Integer maChuyenBay,
            @Param("trangThai") String trangThai,
            Pageable pageable);
}
