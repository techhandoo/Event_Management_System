package com.eventmanager.mapper;

import com.eventmanager.dto.response.EventResponse;
import com.eventmanager.model.Event;
import org.springframework.stereotype.Component;

@Component
public class EventMapper {

    public EventResponse toResponse(Event event) {
        if (event == null) return null;
        return EventResponse.builder()
                .id(event.getId())
                .organizerId(event.getOrganizer().getId())
                .organizerName(event.getOrganizer().getFullName())
                .title(event.getTitle())
                .description(event.getDescription())
                .venue(event.getVenue())
                .city(event.getCity())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .capacity(event.getCapacity())
                .bookedCount(event.getBookedCount())
                .availableCapacity(event.getAvailableCapacity())
                .priceCents(event.getPriceCents())
                .status(event.getStatus())
                .category(event.getCategory())
                .imageUrl(event.getImageUrl())
                .createdAt(event.getCreatedAt())
                .build();
    }
}
