package com.simportal.repository;

import com.simportal.entity.CustomerIdentity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerIdentityRepository extends JpaRepository<CustomerIdentity, String> {}