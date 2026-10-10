package com.simportal.controller;

import com.simportal.dto.AdminStatsDTO;
import com.simportal.entity.Customer;
import com.simportal.entity.CustomerAddress;
import com.simportal.entity.CustomerIdentity;
import com.simportal.entity.SimDetails;
import com.simportal.repository.CustomerAddressRepository;
import com.simportal.repository.CustomerIdentityRepository;
import com.simportal.repository.CustomerRepository;
import com.simportal.repository.SimDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private static final String SERVER_SECRET_SIM = "0000000000000";
    private static final String SERVER_SECRET_SERVICE = "9999999999";
    private static final String ADMIN_TOKEN = "Bearer secret-admin-auth-token-2026";

    @Autowired
    private SimDetailsRepository simRepo;

    @Autowired
    private CustomerRepository customerRepo;

    @Autowired
    private CustomerAddressRepository addressRepo;

    @Autowired
    private CustomerIdentityRepository identityRepo;

    @PostMapping("/verify-backdoor")
    public ResponseEntity<?> verifyBackdoor(@RequestBody Map<String, String> body) {
        String sim = body.get("simNumber");
        String service = body.get("serviceNumber");

        if (SERVER_SECRET_SIM.equals(sim) && SERVER_SECRET_SERVICE.equals(service)) {
            return ResponseEntity.ok(Map.of("token", ADMIN_TOKEN));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid secret credentials");
    }

    @GetMapping("/metrics")
    public ResponseEntity<?> getDashboardMetrics(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!ADMIN_TOKEN.equals(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }
        long totalSims = simRepo.count();
        long active = simRepo.findAll().stream().filter(s -> "active".equalsIgnoreCase(s.getSimStatus())).count();
        long pending = totalSims - active;
        long totalCustomers = customerRepo.count();
        return ResponseEntity.ok(new AdminStatsDTO(totalSims, active, pending, totalCustomers));
    }

    @GetMapping("/sims")
    public ResponseEntity<?> getAllSims(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!ADMIN_TOKEN.equals(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }
        return ResponseEntity.ok(simRepo.findAll());
    }

    @GetMapping("/customers")
    public ResponseEntity<?> getAllCustomers(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!ADMIN_TOKEN.equals(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }
        return ResponseEntity.ok(customerRepo.findAll());
    }

    @PatchMapping("/sims/{simId}/status")
    public ResponseEntity<?> updateSimStatus(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Integer simId,
            @RequestParam String status) {
        if (!ADMIN_TOKEN.equals(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }
        SimDetails sim = simRepo.findById(simId).orElseThrow(() -> new RuntimeException("SIM not found"));
        sim.setSimStatus(status.toLowerCase());
        return ResponseEntity.ok(simRepo.save(sim));
    }

    @PostMapping("/onboard-sim")
    @Transactional
    public ResponseEntity<?> onboardNewSim(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, String> body) {

        if (!ADMIN_TOKEN.equals(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }

        // 1. Create Inactive SIM Kit
        SimDetails sim = new SimDetails();
        sim.setSimNumber(body.get("simNumber"));
        sim.setServiceNumber(body.get("serviceNumber"));
        sim.setSimStatus("inactive");
        SimDetails savedSim = simRepo.save(sim);

        // 2. Persist Registered Delivery / Home Address
        CustomerAddress address = new CustomerAddress();
        address.setAddress(body.get("address"));
        address.setCity(body.get("city"));
        address.setPincode(body.get("pincode"));
        address.setState(body.get("state"));
        CustomerAddress savedAddress = addressRepo.save(address);

        // 3. Persist Government Identity Verification Pool
        CustomerIdentity identity = new CustomerIdentity();
        identity.setUniqueIdNumber(body.get("uniqueIdNumber"));
        identity.setFirstName(body.get("firstName"));
        identity.setLastName(body.get("lastName"));
        identity.setEmailAddress(body.get("emailAddress"));
        identity.setDateOfbirth(LocalDate.parse(body.get("dateOfBirth")));
        identity.setState(body.get("state"));
        identityRepo.save(identity);

        // 4. Persist Linked Customer Account
        Customer customer = new Customer();
        customer.setUniqueIdNumber(body.get("uniqueIdNumber"));
        customer.setFirstName(body.get("firstName"));
        customer.setLastName(body.get("lastName"));
        customer.setEmailAddress(body.get("emailAddress"));
        customer.setDateOfBirth(LocalDate.parse(body.get("dateOfBirth")));
        customer.setIdType(body.getOrDefault("idType", "Aadhaar"));
        customer.setState(body.get("state"));
        customer.setCustomerAddress(savedAddress);
        customer.setSimDetails(savedSim);
        customerRepo.save(customer);

        return ResponseEntity.ok(Map.of(
            "message", "SIM Kit & Subscriber onboarded successfully",
            "simNumber", savedSim.getSimNumber(),
            "serviceNumber", savedSim.getServiceNumber()
        ));
    }
}