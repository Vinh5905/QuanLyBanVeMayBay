package com.vemaybay.repository;

import com.vemaybay.entity.GoiHanhLy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoiHanhLyRepository extends JpaRepository<GoiHanhLy, Integer> {

    List<GoiHanhLy> findByMaVeAndTrangThaiNot(Integer maVe, String trangThai);

    @Query("SELECT COALESCE(SUM(SIZE(g.danhSachKien)), 0) FROM GoiHanhLy g " +
           "WHERE g.maVe = :maVe AND g.trangThai <> 'CANCELLED'")
    int countTotalPiecesByMaVe(@Param("maVe") Integer maVe);
}
