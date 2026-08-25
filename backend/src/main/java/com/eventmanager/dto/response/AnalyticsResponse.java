package com.eventmanager.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsResponse {

    private long totalUsers;
    private long totalOrganizers;
    private long totalAttendees;
    private long totalEvents;
    private long publishedEvents;
    private long totalBookings;
    private long totalRevenueCents;
}
