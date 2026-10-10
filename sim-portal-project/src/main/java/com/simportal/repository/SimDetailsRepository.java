package com.simportal.repository;

import com.simportal.entity.SimDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SimDetailsRepository extends JpaRepository<SimDetails, Integer> {
    Optional<SimDetails> findBySimNumberAndServiceNumber(String simNumber, String serviceNumber);
}