package com.simportal.controller;

import com.simportal.dto.IdProofValidationDTO;
import com.simportal.entity.Customer;
import com.simportal.entity.CustomerAddress;
import com.simportal.entity.CustomerIdentity;
import com.simportal.entity.SimDetails;
import com.simportal.repository.CustomerAddressRepository;
import com.simportal.repository.CustomerIdentityRepository;
import com.simportal.repository.CustomerRepository;
import com.simportal.repository.SimDetailsRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "*")
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CustomerAddressRepository customerAddressRepository;

    @Autowired
    private CustomerIdentityRepository customerIdentityRepository;

    @Autowired
    private SimDetailsRepository simDetailsRepository;

    @PostMapping("/validate-basics")
    public ResponseEntity<?> validateBasics(@RequestBody Map<String, String> request) {
        String email = request.get("emailAddress");
        LocalDate dob = LocalDate.parse(request.get("dateOfBirth"));

        var customer = customerRepository.findByEmailAddressAndDateOfBirth(email, dob);
        if (customer.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("No registered customer matches the provided email and DOB.");
        }
        return ResponseEntity.ok("Customer verified successfully.");
    }

    @PostMapping("/validate-personal")
    public ResponseEntity<?> validatePersonal(@RequestBody Map<String, String> request) {
        String firstName = request.get("firstName");
        String lastName = request.get("lastName");
        String confirmEmail = request.get("confirmEmail");

        var customer = customerRepository.findByFirstNameAndLastName(firstName, lastName);
        if (customer.isEmpty() || !customer.get().getEmailAddress().equalsIgnoreCase(confirmEmail)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Provided identity details do not match account records.");
        }
        return ResponseEntity.ok("Personal details authenticated.");
    }

    @PutMapping("/address")
    public ResponseEntity<?> updateAddress(@RequestBody CustomerAddress address) {
        CustomerAddress saved = customerAddressRepository.save(address);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/validate-id")
    @Transactional
    public ResponseEntity<?> validateIdentityProof(@Valid @RequestBody IdProofValidationDTO request) {
        String uniqueIdNumber = request.getUniqueIdNumber();

        // 1. Verify existence in CustomerIdentity pool by ID
        Optional<CustomerIdentity> identityOpt = customerIdentityRepository.findById(uniqueIdNumber);
        if (identityOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Identity verification failed. Information does not match national records.");
        }

        CustomerIdentity identity = identityOpt.get();

        // 2. Cross-check Name and Date of Birth
        boolean nameMatch = identity.getFirstName().equalsIgnoreCase(request.getFirstName()) &&
                            identity.getLastName().equalsIgnoreCase(request.getLastName());
        
        boolean dobMatch = identity.getDateOfbirth() != null &&
                           identity.getDateOfbirth().equals(request.getDateOfBirth());

        if (!nameMatch || !dobMatch) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Identity verification failed. Details do not match national records.");
        }

        // 3. Locate Customer profile and activate the associated SIM card
        Optional<Customer> customerOpt = customerRepository.findById(uniqueIdNumber);
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            SimDetails sim = customer.getSimDetails();
            if (sim != null) {
                sim.setSimStatus("active");
                simDetailsRepository.save(sim);
            }
        }

        return ResponseEntity.ok("Verification complete! SIM successfully provisioned and activated.");
    }
}