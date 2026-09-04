package com.eventmanager.controller;

import com.eventmanager.dto.request.CreateEventRequest;
import com.eventmanager.dto.request.UpdateEventRequest;
import com.eventmanager.dto.response.ApiResponse;
import com.eventmanager.dto.response.EventResponse;
import com.eventmanager.service.EventService;
import jakarta.validation.Valid;
import com.eventmanager.dto.response.OrganizerStatsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<EventResponse>>> listEvents(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        size = Math.min(size, 50); // Cap at 50 to prevent memory exhaustion
        Page<EventResponse> events = eventService.listEvents(city, category,
                PageRequest.of(page, size, Sort.by("startTime").ascending()));
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<EventResponse>>> searchEvents(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        size = Math.min(size, 50);
        Page<EventResponse> events = eventService.searchEvents(q,
                PageRequest.of(page, size, Sort.by("startTime").ascending()));
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/my/stats")
    public ResponseEntity<ApiResponse<OrganizerStatsResponse>> getMyStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        OrganizerStatsResponse stats = eventService.getOrganizerStats(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<EventResponse>>> getMyEvents(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<EventResponse> events = eventService.getOrganizerEvents(userDetails.getUsername(),
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<EventResponse>> publishEvent(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        EventResponse event = eventService.publishEvent(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Event published successfully", event));
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<Integer>> getAvailability(@PathVariable Long id) {
        int availability = eventService.getAvailability(id);
        return ResponseEntity.ok(ApiResponse.success(availability));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> getEvent(@PathVariable Long id) {
        EventResponse event = eventService.getEvent(id);
        return ResponseEntity.ok(ApiResponse.success(event));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(
            @Valid @RequestBody CreateEventRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        EventResponse event = eventService.createEvent(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Event created successfully", event));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEventRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        EventResponse event = eventService.updateEvent(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Event updated successfully", event));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        eventService.deleteEvent(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Event cancelled successfully", null));
    }
}
