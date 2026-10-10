package com.simportal.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "Customer")
public class Customer {
    @Id
    @Column(length = 16)
    private String uniqueIdNumber;

    private LocalDate dateOfBirth;
    private String emailAddress;

    @Column(length = 15)
    private String firstName;

    @Column(length = 15)
    private String lastName;

    private String idType;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "customerAddress_addressId")
    private CustomerAddress customerAddress;

    @OneToOne
    @JoinColumn(name = "simId")
    private SimDetails simDetails;

    private String state;

    public Customer() {}

    public String getUniqueIdNumber() { return uniqueIdNumber; }
    public void setUniqueIdNumber(String uniqueIdNumber) { this.uniqueIdNumber = uniqueIdNumber; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getEmailAddress() { return emailAddress; }
    public void setEmailAddress(String emailAddress) { this.emailAddress = emailAddress; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getIdType() { return idType; }
    public void setIdType(String idType) { this.idType = idType; }
    public CustomerAddress getCustomerAddress() { return customerAddress; }
    public void setCustomerAddress(CustomerAddress customerAddress) { this.customerAddress = customerAddress; }
    public SimDetails getSimDetails() { return simDetails; }
    public void setSimDetails(SimDetails simDetails) { this.simDetails = simDetails; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
}