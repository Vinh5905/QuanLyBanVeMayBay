package com.vemaybay.repository;

import com.vemaybay.entity.CheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CheckInRepository extends JpaRepository<CheckIn, Integer> {

    Optional<CheckIn> findByMaVe(Integer maVe);

    boolean existsByMaVe(Integer maVe);
}
