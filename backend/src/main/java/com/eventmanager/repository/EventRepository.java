package com.eventmanager.repository;

import com.eventmanager.model.Event;
import com.eventmanager.model.enums.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    Page<Event> findByOrganizerIdAndStatus(Long organizerId, EventStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"organizer"})
    Page<Event> findByOrganizerId(Long organizerId, Pageable pageable);

    Page<Event> findByStatus(EventStatus status, Pageable pageable);

    Page<Event> findByCityAndCategoryAndStatus(String city, String category, EventStatus status, Pageable pageable);

    Page<Event> findByCityAndStatus(String city, EventStatus status, Pageable pageable);

    Page<Event> findByCategoryAndStatus(String category, EventStatus status, Pageable pageable);

    @Query("SELECT e FROM Event e WHERE e.status = 'PUBLISHED' AND e.startTime > :now ORDER BY e.startTime ASC")
    List<Event> findUpcomingPublishedEvents(@Param("now") LocalDateTime now, Pageable pageable);

    @Query("SELECT e FROM Event e WHERE e.status = 'PUBLISHED' AND (LOWER(e.city) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(e.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(e.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Event> searchEvents(@Param("query") String query, Pageable pageable);

    long countByOrganizerIdAndStatus(Long organizerId, EventStatus status);

    long countByOrganizerId(Long organizerId);

    @Query("SELECT COALESCE(SUM(e.priceCents * e.bookedCount), 0) FROM Event e WHERE e.organizer.id = :organizerId")
    long sumRevenueByOrganizerId(@Param("organizerId") Long organizerId);
}
