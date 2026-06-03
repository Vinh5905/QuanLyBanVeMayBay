package com.vemaybay.repository;

import com.vemaybay.entity.KhachHang;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KhachHangRepository extends JpaRepository<KhachHang, Integer> {

    Optional<KhachHang> findByMaKhachHangAndIsDeletedFalse(Integer maKhachHang);

    boolean existsByEmailAndIsDeletedFalse(String email);

    boolean existsByCccdAndIsDeletedFalse(String cccd);

    @Query("SELECT kh FROM KhachHang kh WHERE kh.isDeleted = false " +
            "AND (:keyword IS NULL OR LOWER(kh.hoTen) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "   OR LOWER(kh.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "   OR LOWER(kh.soDienThoai) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "   OR LOWER(kh.cccd) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<KhachHang> findWithFilters(@Param("keyword") String keyword, Pageable pageable);
}
