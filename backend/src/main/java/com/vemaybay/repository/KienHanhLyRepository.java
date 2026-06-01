package com.vemaybay.repository;

import com.vemaybay.entity.KienHanhLy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KienHanhLyRepository extends JpaRepository<KienHanhLy, Integer> {

    List<KienHanhLy> findByMaGoiHanhLy(Integer maGoiHanhLy);

    @Query("SELECT COUNT(k) FROM KienHanhLy k " +
           "JOIN GoiHanhLy g ON k.maGoiHanhLy = g.maGoiHanhLy " +
           "WHERE g.maVe = :maVe AND g.trangThai <> 'CANCELLED'")
    int countByMaVe(@Param("maVe") Integer maVe);
}
