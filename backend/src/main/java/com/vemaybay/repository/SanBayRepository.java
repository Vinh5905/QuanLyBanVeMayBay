package com.vemaybay.repository;

import com.vemaybay.entity.SanBay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SanBayRepository extends JpaRepository<SanBay, String> {

    List<SanBay> findByIsActiveTrue();
}
