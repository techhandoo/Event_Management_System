package com.eventmanager.service;

import com.eventmanager.dto.response.AnalyticsResponse;
import com.eventmanager.dto.response.UserResponse;
import com.eventmanager.mapper.UserMapper;
import com.eventmanager.model.enums.EventStatus;
import com.eventmanager.model.enums.Role;
import com.eventmanager.repository.BookingRepository;
import com.eventmanager.repository.EventRepository;
import com.eventmanager.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final UserMapper userMapper;

    public AdminService(UserRepository userRepository,
                        EventRepository eventRepository,
                        BookingRepository bookingRepository,
                        UserMapper userMapper) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.bookingRepository = bookingRepository;
        this.userMapper = userMapper;
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> listUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(userMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics() {
        long totalUsers = userRepository.count();
        long totalOrganizers = userRepository.countByRole(Role.ORGANIZER);
        long totalAttendees = userRepository.countByRole(Role.ATTENDEE);
        long totalEvents = eventRepository.count();
        long publishedEvents = eventRepository.countByOrganizerIdAndStatus(null, EventStatus.PUBLISHED);
        long totalBookings = bookingRepository.countAll();
        long totalRevenue = bookingRepository.sumAllRevenue();

        return AnalyticsResponse.builder()
                .totalUsers(totalUsers)
                .totalOrganizers(totalOrganizers)
                .totalAttendees(totalAttendees)
                .totalEvents(totalEvents)
                .publishedEvents(publishedEvents)
                .totalBookings(totalBookings)
                .totalRevenueCents(totalRevenue)
                .build();
    }
}
