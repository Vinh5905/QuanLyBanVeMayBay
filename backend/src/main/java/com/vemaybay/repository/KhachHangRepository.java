package com.vemaybay.repository;

import com.vemaybay.entity.KhachHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KhachHangRepository extends JpaRepository<KhachHang, Integer> {

    Optional<KhachHang> findByMaKhachHangAndIsDeletedFalse(Integer maKhachHang);

    List<KhachHang> findByCccdAndIsDeletedFalse(String cccd);

    boolean existsByEmailAndIsDeletedFalse(String email);

    boolean existsByCccdAndIsDeletedFalse(String cccd);
}
