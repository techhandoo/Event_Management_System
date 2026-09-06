package com.eventmanager.repository;

import com.eventmanager.model.Booking;
import com.eventmanager.model.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByUserIdAndEventId(Long userId, Long eventId);

    boolean existsByUserIdAndEventIdAndStatusIn(Long userId, Long eventId, List<BookingStatus> statuses);

    Page<Booking> findByUserIdAndStatus(Long userId, BookingStatus status, Pageable pageable);

    Page<Booking> findByUserId(Long userId, Pageable pageable);

    // Optimized query using idx_bookings_event_status composite index
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.event.id = :eventId AND b.status = 'CONFIRMED'")
    long countConfirmedBookingsByEventId(@Param("eventId") Long eventId);

    // Optimized query using idx_bookings_user_status composite index
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.user.id = :userId AND b.status = 'CONFIRMED'")
    long countConfirmedBookingsByUserId(@Param("userId") Long eventId);

    List<Booking> findByEventIdAndStatus(Long eventId, BookingStatus status);

    Optional<Booking> findByRazorpayOrderId(String razorpayOrderId);

    @Query("SELECT COUNT(b) FROM Booking b")
    long countAll();

    @Query("SELECT COALESCE(SUM(b.totalCents), 0) FROM Booking b WHERE b.status = 'CONFIRMED'")
    long sumAllRevenue();

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.event.organizer.id = :organizerId AND b.status = 'CONFIRMED'")
    long countConfirmedByOrganizerId(@Param("organizerId") Long organizerId);

    @Query("SELECT COUNT(DISTINCT b.user.id) FROM Booking b WHERE b.event.organizer.id = :organizerId AND b.status = 'CONFIRMED'")
    long countDistinctAttendeesByOrganizerId(@Param("organizerId") Long organizerId);

    /**
     * Find PENDING bookings older than the given cutoff — candidates for cleanup.
     * These are bookings where the user abandoned the Razorpay payment flow.
     */
    @Query("SELECT b FROM Booking b WHERE b.status = 'PENDING' AND b.bookedAt < :cutoff")
    List<Booking> findStalePendingBookings(@Param("cutoff") LocalDateTime cutoff);

    @Modifying
    @Query("UPDATE Booking b SET b.status = 'CANCELLED' WHERE b.status = 'PENDING' AND b.bookedAt < :cutoff")
    int cancelStalePendingBookings(@Param("cutoff") LocalDateTime cutoff);
}
