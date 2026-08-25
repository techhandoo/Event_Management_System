# Implementation Plan — Event Management Platform

## Timeline: 6 Weeks

---

## Phase 1: Foundation & MVP (Week 1-2)

### Week 1: Backend Core

#### Day 1-2: Project Setup
- [ ] Initialize Spring Boot project with Maven
- [ ] Add dependencies: Spring Web, Spring Security, JPA, MySQL, Kafka, Redis, Validation, Lombok, SpringDoc
- [ ] Create project structure (controller, service, repository, model, dto, config)
- [ ] Configure application.yml with profiles (dev, test, prod)
- [ ] Set up Docker Compose (MySQL 8, Kafka, Zookeeper, Redis)
- [ ] Create Flyway migration scripts for initial schema

#### Day 3: Database & Entities
- [ ] Define JPA entities: User, Event, Booking, Notification
- [ ] Define enums: Role, BookingStatus, EventStatus
- [ ] Create repository interfaces with custom query methods
- [ ] Add composite indexes for booking optimization
- [ ] Test schema with Flyway migrations

#### Day 4: Authentication
- [ ] Implement JwtTokenProvider (generate, validate, parse)
- [ ] Implement JwtAuthenticationFilter (OncePerRequestFilter)
- [ ] Implement CustomUserDetailsService
- [ ] Configure SecurityConfig (filter chain, CORS, endpoint rules)
- [ ] Build AuthController (register, login, refresh)
- [ ] Build Auth integration tests

#### Day 5: User Profile
- [ ] Build UserController (get profile, update profile)
- [ ] Implement UserMapper (entity ↔ DTO)
- [ ] Add request validation (Bean Validation)
- [ ] Add global exception handler

---

### Week 2: Events, Bookings & Kafka

#### Day 6-7: Events CRUD
- [ ] Build EventController (7 endpoints)
- [ ] Implement EventService (create, list, get, update, delete, publish)
- [ ] Implement EventMapper
- [ ] Add pagination support (Pageable)
- [ ] Add filtering (city, category, status)
- [ ] Add capacity availability endpoint

#### Day 8: Bookings
- [ ] Build BookingController (4 endpoints)
- [ ] Implement BookingService with capacity check
- [ ] Implement unique booking constraint handling
- [ ] Add optimistic locking for concurrent bookings
- [ ] Build BookingMapper

#### Day 9: Kafka Integration
- [ ] Configure Kafka producer (BookingEventProducer, EventEventProducer)
- [ ] Configure Kafka consumer (BookingEventConsumer, NotificationConsumer)
- [ ] Create DLQ handler for failed messages
- [ ] Implement booking event flow (create → Kafka → confirm → notify)
- [ ] Test end-to-end with local Kafka

#### Day 10: Frontend Sprint 1
- [ ] Initialize React + TypeScript project
- [ ] Set up routing (React Router v6)
- [ ] Build auth context and protected routes
- [ ] Build Login and Register pages
- [ ] Build Event listing page (with filters)
- [ ] Build Event detail page
- [ ] Build Booking flow

---

## Phase 2: Enhanced Features (Week 3-4)

### Week 3: Advanced Backend

#### Day 11-12: Admin & Search
- [ ] Build AdminController (user management, analytics)
- [ ] Implement event search with LIKE queries + index optimization
- [ ] Add event statistics (booking count, revenue)
- [ ] Implement user ban/role-change endpoints

#### Day 13-14: Notifications & Caching
- [ ] Build NotificationController (list, mark read)
- [ ] Implement Redis caching for popular events
- [ ] Add cache eviction on event updates
- [ ] Build notification center (unread count, list)

#### Day 15: Pricing & Multi-Ticket
- [ ] Implement dynamic pricing logic
- [ ] Add ticket quantity support to bookings
- [ ] Add booking summary with price calculation

### Week 4: Frontend Sprint 2

#### Day 16-17: Dashboard
- [ ] Build organizer dashboard (my events, booking stats)
- [ ] Build admin dashboard (user list, platform analytics)
- [ ] Build event creation/edit form with validation

#### Day 18-19: Notification UI
- [ ] Build notification center component
- [ ] Add real-time notification polling
- [ ] Build booking history page

#### Day 20: Polish
- [ ] Add loading states and error boundaries
- [ ] Implement optimistic UI for bookings
- [ ] Add responsive design for mobile
- [ ] Fix edge cases and form validations

---

## Phase 3: Production Hardening (Week 5-6)

### Week 5: Testing & Security

#### Day 21-22: Backend Testing
- [ ] Unit tests for all services (Mockito)
- [ ] Integration tests with Testcontainers (MySQL, Kafka)
- [ ] API contract tests
- [ ] Achieve 80%+ code coverage

#### Day 23-24: Security Hardening
- [ ] Add rate limiting (Bucket4j or custom)
- [ ] Add input sanitization
- [ ] Add audit logging
- [ ] Add health check endpoints (Spring Actuator)
- [ ] Add structured logging with correlation IDs

#### Day 25: Performance
- [ ] Run EXPLAIN on all major queries
- [ ] Optimize slow queries
- [ ] Tune HikariCP connection pool
- [ ] Add Redis caching for event listings
- [ ] Benchmark booking query before/after indexes

### Week 6: Deployment

#### Day 26-27: Docker & CI/CD
- [ ] Multi-stage Dockerfile for Spring Boot
- [ ] Multi-stage Dockerfile for React
- [ ] GitHub Actions workflow (build, test, deploy)
- [ ] Configure Render service
- [ ] Configure Vercel project

#### Day 28-29: Production Deployment
- [ ] Deploy Kafka to Aiven (free tier)
- [ ] Deploy MySQL to Render
- [ ] Deploy Spring Boot to Render
- [ ] Deploy React to Vercel
- [ ] Configure environment variables
- [ ] Run smoke tests against production

#### Day 30: Final Polish
- [ ] Update README with setup instructions
- [ ] Add API documentation screenshots
- [ ] Record demo video / create presentation
- [ ] Write deployment runbook
- [ ] Final code review and cleanup

---

## Milestone Checkpoints

| Milestone | Week | Deliverable | Status |
|-----------|------|-------------|--------|
| M1 | 1 | Auth + DB schema working locally | ⬜ |
| M2 | 2 | Full CRUD + Kafka flow + basic frontend | ⬜ |
| M3 | 3 | Admin, search, notifications, caching | ⬜ |
| M4 | 4 | Complete frontend with dashboard | ⬜ |
| M5 | 5 | 80% test coverage, security hardening | ⬜ |
| M6 | 6 | Deployed to production, demo ready | ⬜ |

---

## Resume Bullet Point Mapping

| Resume Claim | Implementation | Status |
|-------------|----------------|--------|
| "Built a full-stack event management platform" | Spring Boot + React + Kafka | ⬜ |
| "enabling users to register, authenticate" | JWT auth with Spring Security | ⬜ |
| "create and manage events" | Event CRUD with role-based access | ⬜ |
| "handle event booking workflows" | Booking with Kafka event flow | ⬜ |
| "Designed and developed scalable RESTful APIs using Spring Boot" | 20 endpoints, layered architecture | ⬜ |
| "Implemented JWT-based authentication" | JwtTokenProvider + Filter | ⬜ |
| "role-based authorization using Spring Security" | ADMIN/ORGANIZER/ATTENDEE roles | ⬜ |
| "secure 8+ API endpoints" | 20 endpoints secured | ⬜ |
| "manage user sessions" | JWT + Redis blacklist | ⬜ |
| "Optimized MySQL schema with proper indexing" | Composite indexes on bookings | ⬜ |
| "reducing booking query execution time by 35%" | Benchmark before/after indexes | ⬜ |
| "high-concurrency event registration" | Optimistic locking + unique constraints | ⬜ |
