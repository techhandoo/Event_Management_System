# Project Scope — Event Management Platform

## 1. Product Vision

Build a full-stack event management platform where organizers can create events, attendees can discover and book events, and administrators can manage the platform — all backed by event-driven architecture with Kafka.

---

## 2. User Roles & Permissions

| Role | Capabilities |
|------|-------------|
| **ANONYMOUS** | Browse events, view event details, register |
| **ATTENDEE** | All anonymous + book events, manage own bookings, update profile |
| **ORGANIZER** | All attendee + create/manage own events, view event analytics |
| **ADMIN** | All organizer + manage users, view platform analytics, manage all events |

---

## 3. Feature Roadmap

### Phase 1: MVP (Week 1-2)
> Core functionality — the absolute minimum to demonstrate the resume bullet points

#### Authentication & Users
- [ ] User registration with email/password
- [ ] Login with JWT access + refresh token
- [ ] Logout with token blacklisting
- [ ] Get/update own profile
- [ ] Role assignment (default: ATTENDEE)

#### Events (CRUD)
- [ ] Create event (ORGANIZER, ADMIN)
- [ ] List events with pagination, filtering by city/category
- [ ] Get event details
- [ ] Update event (owner only)
- [ ] Cancel event (owner only, cascades to bookings)
- [ ] Publish event (DRAFT → PUBLISHED)

#### Bookings
- [ ] Book event (check capacity, prevent duplicates)
- [ ] List own bookings
- [ ] Cancel booking (releases capacity)
- [ ] Booking confirmation via Kafka → notification consumer

#### Infrastructure
- [ ] MySQL schema with optimized indexes
- [ ] Kafka producer for booking events
- [ ] Kafka consumer for notifications
- [ ] Docker Compose for local dev (App + MySQL + Kafka + Zookeeper)
- [ ] React frontend with auth, event listing, booking flow

---

### Phase 2: Enhanced Features (Week 3-4)
> Features that elevate the project beyond basic CRUD

#### Advanced Events
- [ ] Event search with full-text query
- [ ] Event image upload (via presigned URL)
- [ ] Event categories with dynamic filtering
- [ ] Event capacity visualization (available/total)

#### Booking Enhancements
- [ ] Multi-ticket booking (quantity selection)
- [ ] Dynamic pricing based on demand
- [ ] Booking history with status timeline
- [ ] Refund processing (admin-initiated)

#### Notifications
- [ ] Email notifications (booking confirmation, event reminders)
- [ ] In-app notification center
- [ ] Notification preferences per user
- [ ] Batch notifications for event updates

#### Admin Dashboard
- [ ] User management (list, ban, role changes)
- [ ] Platform analytics (total events, bookings, revenue)
- [ ] Event moderation (approve/reject)

---

### Phase 3: Production-Ready (Week 5-6)
> Hardening, performance, and deployment

#### Performance
- [ ] Redis caching for popular events
- [ ] Database query optimization (EXPLAIN analysis)
- [ ] Connection pool tuning
- [ ] Kafka batch processing for high throughput

#### Security
- [ ] Rate limiting (per IP, per user)
- [ ] Input sanitization and XSS prevention
- [ ] CSRF protection for form submissions
- [ ] Audit logging for admin actions
- [ ] HTTPS enforcement

#### Deployment
- [ ] Multi-stage Docker builds
- [ ] CI/CD with GitHub Actions
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Vercel
- [ ] Managed Kafka (Aiven) for production
- [ ] Health check and monitoring endpoints

#### Testing
- [ ] Unit tests for services (80%+ coverage)
- [ ] Integration tests with Testcontainers
- [ ] API contract tests
- [ ] Load testing with k6 or JMeter

---

## 4. User Stories

### Authentication
```
As a new user,
I want to register with my email and password,
So that I can access the platform's features.

As a registered user,
I want to log in and receive a JWT token,
So that I can make authenticated API requests.

As a logged-in user,
I want to refresh my access token without re-logging in,
So that I have a seamless experience.
```

### Events
```
As an organizer,
I want to create an event with title, description, venue, capacity, and price,
So that attendees can discover and book my event.

As an attendee,
I want to browse and filter events by city, category, and date,
So that I can find events I'm interested in.

As an attendee,
I want to view event details including available capacity,
So that I can decide whether to book.
```

### Bookings
```
As an attendee,
I want to book a ticket for an event,
So that I can attend the event.

As the system,
I want to prevent double-booking using database constraints,
So that no event is over-capacity.

As an attendee,
I want to cancel a booking,
So that the slot is freed for others.

As an organizer,
I want to receive a Kafka event when someone books my event,
So that I can send confirmation emails asynchronously.
```

---

## 5. API Surface Summary

| Category | Endpoints | Auth Required |
|----------|-----------|---------------|
| Authentication | 3 (register, login, refresh) | Partial |
| User Profile | 2 (get, update) | Yes |
| Events | 7 (list, get, create, update, delete, publish, availability) | Partial |
| Bookings | 4 (create, list mine, get, cancel) | Yes |
| Admin | 2 (users list, analytics) | Yes (ADMIN) |
| System | 2 (health, swagger) | No |
| **Total** | **20 endpoints** | — |

This exceeds the resume target of "8+ API endpoints" by 150%.

---

## 6. Out of Scope (for now)

- Payment processing (Stripe/PayPal integration)
- Social login (Google, GitHub OAuth)
- Real-time WebSocket updates
- Mobile app (React Native)
- Multi-tenant architecture
- Internationalization (i18n)
- Accessibility (WCAG) audit
- Load balancing at scale

---

## 7. Success Criteria

| Metric | Target |
|--------|--------|
| API response time (p95) | < 200ms |
| Booking query time (with indexes) | 35% improvement over baseline |
| API endpoints | 20+ |
| Test coverage | 80%+ on services |
| Docker build time | < 3 min |
| Frontend load time | < 2s on 3G |
| Zero double-bookings | 100% (DB constraint) |
