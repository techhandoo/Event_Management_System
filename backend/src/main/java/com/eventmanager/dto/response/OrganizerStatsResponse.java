package com.eventmanager.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizerStatsResponse {
    private long totalEvents;
    private long publishedEvents;
    private long draftEvents;
    private long totalBookings;
    private long totalRevenueCents;
    private long totalAttendees;
}
