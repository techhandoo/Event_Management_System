package com.eventmanager.model;

import com.eventmanager.model.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "bookings", 
    uniqueConstraints = @UniqueConstraint(name = "uk_booking_user_event", columnNames = {"user_id", "event_id"}),
    indexes = {
        @Index(name = "idx_bookings_event_status", columnList = "event_id, status"),
        @Index(name = "idx_bookings_user_status", columnList = "user_id, status"),
        @Index(name = "idx_bookings_event_booked", columnList = "event_id, booked_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "total_cents", nullable = false)
    private Long totalCents;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "payment_id", length = 255)
    private String paymentId;

    @Column(name = "razorpay_order_id", length = 255)
    private String razorpayOrderId;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "booked_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime bookedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
