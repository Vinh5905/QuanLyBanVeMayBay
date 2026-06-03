package com.vemaybay.repository;

import com.vemaybay.entity.TrungGian;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrungGianRepository extends JpaRepository<TrungGian, Integer> {

    List<TrungGian> findByChuyenBay_MaChuyenBayOrderByThuTuAsc(Integer maChuyenBay);
}
