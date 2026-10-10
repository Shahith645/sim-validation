package com.simportal.service;

import com.simportal.dto.IdProofValidationDTO;
import com.simportal.entity.CustomerIdentity;
import com.simportal.exception.SimPortalException;
import com.simportal.repository.CustomerIdentityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class CustomerServiceImpl {

    @Autowired
    private CustomerIdentityRepository customerIdentityRepository;

    public String validateIdProof(IdProofValidationDTO dto) throws SimPortalException {
        // 1. Accept 12-digit Aadhaar or 16-digit National IDs
        String idNumber = dto.getUniqueIdNumber();
        if (idNumber == null || (idNumber.length() != 12 && idNumber.length() != 16)) {
            throw new SimPortalException("Id should be 12 digits (Aadhaar) or 16 digits");
        }

        // 2. Direct assignment since dto.getDateOfBirth() is already a LocalDate
        LocalDate inputDob = dto.getDateOfBirth();
        if (inputDob == null) {
            throw new SimPortalException("Incorrect date of birth details");
        }

        // 3. Fetch from repository using findById
        CustomerIdentity identity = customerIdentityRepository.findById(idNumber)
                .orElseThrow(() -> new SimPortalException("Invalid details"));

        // 4. Validate First Name and Last Name
        if (!identity.getFirstName().equalsIgnoreCase(dto.getFirstName()) ||
            !identity.getLastName().equalsIgnoreCase(dto.getLastName())) {
            throw new SimPortalException("Invalid details");
        }

        // 5. Validate Date of Birth
        if (identity.getDateOfbirth() == null || !identity.getDateOfbirth().equals(inputDob)) {
            throw new SimPortalException("Incorrect date of birth details");
        }

        return "Success";
    }
}