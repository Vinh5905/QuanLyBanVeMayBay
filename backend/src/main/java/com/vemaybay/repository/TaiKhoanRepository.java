package com.vemaybay.repository;

import com.vemaybay.entity.TaiKhoan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Integer> {

    Optional<TaiKhoan> findByTenDangNhap(String tenDangNhap);

    Optional<TaiKhoan> findByEmail(String email);

    boolean existsByTenDangNhap(String tenDangNhap);

    boolean existsByEmail(String email);

    @Query("SELECT t FROM TaiKhoan t WHERE " +
           "(:vaiTro IS NULL OR t.vaiTro.tenVaiTro = :vaiTro) AND " +
           "(:trangThai IS NULL OR t.trangThai = :trangThai) AND " +
           "(:keyword IS NULL OR LOWER(t.tenDangNhap) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "   OR LOWER(t.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<TaiKhoan> findWithFilters(
            @Param("vaiTro") String vaiTro,
            @Param("trangThai") Byte trangThai,
            @Param("keyword") String keyword,
            Pageable pageable);
}
