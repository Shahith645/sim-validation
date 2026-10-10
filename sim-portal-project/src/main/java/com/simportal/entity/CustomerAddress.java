package com.simportal.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "CustomerAddress")
public class CustomerAddress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer addressId;

    @Column(length = 25)
    private String address;

    @Column(length = 50)
    private String city;

    @Column(length = 6)
    private String pincode;

    @Column(length = 50)
    private String state;

    public CustomerAddress() {}

    public Integer getAddressId() { return addressId; }
    public void setAddressId(Integer addressId) { this.addressId = addressId; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
}