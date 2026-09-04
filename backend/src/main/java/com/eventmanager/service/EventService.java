package com.eventmanager.service;

import com.eventmanager.dto.request.CreateEventRequest;
import com.eventmanager.dto.request.UpdateEventRequest;
import com.eventmanager.dto.response.EventResponse;
import com.eventmanager.dto.response.OrganizerStatsResponse;
import com.eventmanager.exception.ResourceNotFoundException;
import com.eventmanager.kafka.event.EventEvent;
import com.eventmanager.kafka.producer.EventEventProducer;
import com.eventmanager.mapper.EventMapper;
import com.eventmanager.model.Event;
import com.eventmanager.model.User;
import com.eventmanager.model.enums.EventStatus;
import com.eventmanager.repository.BookingRepository;
import com.eventmanager.repository.EventRepository;
import com.eventmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EventMapper eventMapper;
    private final BookingRepository bookingRepository;
    @Autowired(required = false)
    private EventEventProducer eventEventProducer;

    public EventService(EventRepository eventRepository,
                        UserRepository userRepository,
                        EventMapper eventMapper,
                        BookingRepository bookingRepository) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.eventMapper = eventMapper;
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public EventResponse createEvent(CreateEventRequest request, String organizerEmail) {
        User organizer = userRepository.findByEmail(organizerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", organizerEmail));

        Event event = Event.builder()
                .organizer(organizer)
                .title(request.getTitle())
                .description(request.getDescription())
                .venue(request.getVenue())
                .city(request.getCity())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .capacity(request.getCapacity())
                .priceCents(request.getPriceCents())
                .category(request.getCategory())
                .imageUrl(request.getImageUrl())
                .status(EventStatus.DRAFT)
                .build();

        event = eventRepository.save(event);
        return eventMapper.toResponse(event);
    }

    @Transactional(readOnly = true)
    public Page<EventResponse> listEvents(String city, String category, Pageable pageable) {
        if (city != null && category != null) {
            return eventRepository.findByCityAndCategoryAndStatus(city, category, EventStatus.PUBLISHED, pageable)
                    .map(eventMapper::toResponse);
        } else if (city != null) {
            return eventRepository.findByCityAndStatus(city, EventStatus.PUBLISHED, pageable)
                    .map(eventMapper::toResponse);
        } else if (category != null) {
            return eventRepository.findByCategoryAndStatus(category, EventStatus.PUBLISHED, pageable)
                    .map(eventMapper::toResponse);
        }
        return eventRepository.findByStatus(EventStatus.PUBLISHED, pageable)
                .map(eventMapper::toResponse);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "event-detail", key = "#eventId")
    public EventResponse getEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        return eventMapper.toResponse(event);
    }

    @Caching(evict = {
        @CacheEvict(value = "event-detail", key = "#eventId"),
        @CacheEvict(value = "events", allEntries = true)
    })
    @Transactional
    public EventResponse updateEvent(Long eventId, UpdateEventRequest request, String userEmail) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        if (!event.getOrganizer().getId().equals(user.getId()) && user.getRole() != com.eventmanager.model.enums.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("You can only update your own events");
        }

        if (request.getTitle() != null) event.setTitle(request.getTitle());
        if (request.getDescription() != null) event.setDescription(request.getDescription());
        if (request.getVenue() != null) event.setVenue(request.getVenue());
        if (request.getCity() != null) event.setCity(request.getCity());
        if (request.getStartTime() != null) event.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) event.setEndTime(request.getEndTime());
        if (request.getCapacity() != null) event.setCapacity(request.getCapacity());
        if (request.getPriceCents() != null) event.setPriceCents(request.getPriceCents());
        if (request.getCategory() != null) event.setCategory(request.getCategory());
        if (request.getImageUrl() != null) event.setImageUrl(request.getImageUrl());

        event = eventRepository.save(event);
        return eventMapper.toResponse(event);
    }

    @Caching(evict = {
        @CacheEvict(value = "event-detail", key = "#eventId"),
        @CacheEvict(value = "events", allEntries = true)
    })
    @Transactional
    public void deleteEvent(Long eventId, String userEmail) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        if (!event.getOrganizer().getId().equals(user.getId()) && user.getRole() != com.eventmanager.model.enums.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("You can only delete your own events");
        }

        event.setStatus(EventStatus.CANCELLED);
        eventRepository.save(event);

        // ── Kafka: publish event.cancelled ─────────────────────────
        EventEvent kafkaEvent = EventEvent.of(
                event.getId(),
                event.getOrganizer().getId(),
                event.getTitle(),
                "CANCELLED"
        );
        if (eventEventProducer != null) eventEventProducer.sendEventEvent(kafkaEvent);
    }

    @Caching(evict = {
        @CacheEvict(value = "event-detail", key = "#eventId"),
        @CacheEvict(value = "events", allEntries = true)
    })
    @Transactional
    public EventResponse publishEvent(Long eventId, String userEmail) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        if (!event.getOrganizer().getId().equals(user.getId()) && user.getRole() != com.eventmanager.model.enums.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("You can only publish your own events");
        }

        if (event.getStatus() != EventStatus.DRAFT) {
            throw new IllegalArgumentException("Only draft events can be published");
        }

        event.setStatus(EventStatus.PUBLISHED);
        event = eventRepository.save(event);

        // ── Kafka: publish event.published ──────────────────────────
        EventEvent kafkaEvent = EventEvent.of(
                event.getId(),
                event.getOrganizer().getId(),
                event.getTitle(),
                "PUBLISHED"
        );
        if (eventEventProducer != null) eventEventProducer.sendEventEvent(kafkaEvent);

        return eventMapper.toResponse(event);
    }

    @Transactional(readOnly = true)
    public int getAvailability(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        return event.getAvailableCapacity();
    }

    @Transactional(readOnly = true)
    public Page<EventResponse> getOrganizerEvents(String organizerEmail, Pageable pageable) {
        User organizer = userRepository.findByEmail(organizerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", organizerEmail));
        return eventRepository.findByOrganizerId(organizer.getId(), pageable)
                .map(eventMapper::toResponse);
    }

    // ── Organizer Stats ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public OrganizerStatsResponse getOrganizerStats(String organizerEmail) {
        User organizer = userRepository.findByEmail(organizerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", organizerEmail));

        long totalEvents = eventRepository.countByOrganizerId(organizer.getId());
        long publishedEvents = eventRepository.countByOrganizerIdAndStatus(organizer.getId(), EventStatus.PUBLISHED);
        long draftEvents = eventRepository.countByOrganizerIdAndStatus(organizer.getId(), EventStatus.DRAFT);
        long totalRevenue = eventRepository.sumRevenueByOrganizerId(organizer.getId());
        long totalBookings = bookingRepository.countConfirmedByOrganizerId(organizer.getId());

        return OrganizerStatsResponse.builder()
                .totalEvents(totalEvents)
                .publishedEvents(publishedEvents)
                .draftEvents(draftEvents)
                .totalBookings(totalBookings)
                .totalRevenueCents(totalRevenue)
                .build();
    }

    // ── Search ─────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<EventResponse> searchEvents(String query, Pageable pageable) {
        return eventRepository.searchEvents(query, pageable)
                .map(eventMapper::toResponse);
    }
}
