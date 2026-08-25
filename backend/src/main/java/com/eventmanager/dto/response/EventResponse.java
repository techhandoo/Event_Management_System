package com.eventmanager.dto.response;

import com.eventmanager.model.enums.EventStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventResponse {

    private Long id;
    private Long organizerId;
    private String organizerName;
    private String title;
    private String description;
    private String venue;
    private String city;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer capacity;
    private Integer bookedCount;
    private Integer availableCapacity;
    private Long priceCents;
    private EventStatus status;
    private String category;
    private String imageUrl;
    private LocalDateTime createdAt;
}
