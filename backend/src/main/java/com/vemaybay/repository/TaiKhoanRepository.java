package com.vemaybay.repository;

import com.vemaybay.entity.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Integer> {

    Optional<TaiKhoan> findByTenDangNhap(String tenDangNhap);

    Optional<TaiKhoan> findByEmail(String email);

    boolean existsByTenDangNhap(String tenDangNhap);

    boolean existsByEmail(String email);
}
