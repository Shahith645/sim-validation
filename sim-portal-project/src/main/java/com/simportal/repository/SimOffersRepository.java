package com.simportal.repository;

import com.simportal.entity.SimOffers;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SimOffersRepository extends JpaRepository<SimOffers, Integer> {
    List<SimOffers> findBySimDetails_SimId(Integer simId);
}