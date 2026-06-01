package com.vemaybay.repository;

import com.vemaybay.entity.BangGiaHanhLy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BangGiaHanhLyRepository extends JpaRepository<BangGiaHanhLy, Integer> {

    List<BangGiaHanhLy> findByIsActiveTrue();
}
