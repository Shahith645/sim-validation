package com.simportal.controller;

import com.simportal.dto.SimValidationDTO;
import com.simportal.entity.SimOffers;
import com.simportal.service.SimService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sim")
@CrossOrigin(origins = "*")
public class SimController {

    @Autowired
    private SimService simService;

    @PostMapping("/validate")
    public ResponseEntity<List<SimOffers>> validateSim(@RequestBody SimValidationDTO request) {
        return ResponseEntity.ok(simService.validateSim(request));
    }
}