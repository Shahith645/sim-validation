package com.simportal.dto;

public class AddressDTO {
    private Integer addressId;
    private String address;
    private String city;
    private String pincode;
    private String state;

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