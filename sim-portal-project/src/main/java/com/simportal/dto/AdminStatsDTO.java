package com.simportal.dto;

public class AdminStatsDTO {
    private long totalSims;
    private long activeSims;
    private long pendingSims;
    private long totalCustomers;

    public AdminStatsDTO(long totalSims, long activeSims, long pendingSims, long totalCustomers) {
        this.totalSims = totalSims;
        this.activeSims = activeSims;
        this.pendingSims = pendingSims;
        this.totalCustomers = totalCustomers;
    }

    public long getTotalSims() { return totalSims; }
    public long getActiveSims() { return activeSims; }
    public long getPendingSims() { return pendingSims; }
    public long getTotalCustomers() { return totalCustomers; }
}