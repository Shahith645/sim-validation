package com.simportal.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "CustomerIdentity")
public class CustomerIdentity {
    @Id
    @Column(length = 16)
    private String uniqueIdNumber;

    private LocalDate dateOfbirth;
    private String firstName;
    private String lastName;
    private String emailAddress;
    private String state;

    public CustomerIdentity() {}

    public String getUniqueIdNumber() { return uniqueIdNumber; }
    public void setUniqueIdNumber(String uniqueIdNumber) { this.uniqueIdNumber = uniqueIdNumber; }
    public LocalDate getDateOfbirth() { return dateOfbirth; }
    public void setDateOfbirth(LocalDate dateOfbirth) { this.dateOfbirth = dateOfbirth; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmailAddress() { return emailAddress; }
    public void setEmailAddress(String emailAddress) { this.emailAddress = emailAddress; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
}