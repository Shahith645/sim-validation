package com.simportal.service;

import com.simportal.dto.SimValidationDTO;
import com.simportal.entity.SimDetails;
import com.simportal.entity.SimOffers;
import com.simportal.exception.SimPortalException;
import com.simportal.repository.SimDetailsRepository;
import com.simportal.repository.SimOffersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SimService {

    @Autowired
    private SimDetailsRepository simDetailsRepository;

    @Autowired
    private SimOffersRepository simOffersRepository;

    public List<SimOffers> validateSim(SimValidationDTO dto) {
        if (dto.getSimNumber() == null || !dto.getSimNumber().matches("^\\d{13}$") ||
            dto.getServiceNumber() == null || !dto.getServiceNumber().matches("^\\d{10}$")) {
            throw new SimPortalException("Invalid details, please check again SIM number/Service number!");
        }

        SimDetails sim = simDetailsRepository
                .findBySimNumberAndServiceNumber(dto.getSimNumber(), dto.getServiceNumber())
                .orElseThrow(() -> new SimPortalException("Invalid details, please check again SIM number/Service number!"));

        if ("active".equalsIgnoreCase(sim.getSimStatus())) {
            throw new SimPortalException("SIM already active");
        }

        return simOffersRepository.findBySimDetails_SimId(sim.getSimId());
    }
}