# Project Context — Event Management Platform

## 1. Project Overview

**Name:** FreeBuff Event Manager  
**Type:** Full-Stack Web Application  
**Domain:** Event Management & Ticketing  
**Target Users:** Event organizers, attendees, and platform administrators

A production-grade event management platform that enables users to register, authenticate, create and manage events, and handle event booking workflows with real-time notifications powered by Apache Kafka.

## 2. Problem Statement

Event organizers need a reliable, scalable platform to:
- Create and manage events with capacity tracking
- Process bookings with real-time availability
- Send automated notifications (booking confirmations, reminders, cancellations)
- Handle high-concurrency registration scenarios without double-booking

Existing solutions are either expensive (Eventbrite), lack customization (Google Forms), or don't scale (spreadsheet-based). This platform provides a self-hosted, open alternative with modern architecture.

## 3. Design Decisions

### Why Spring Boot?
- Mature ecosystem with excellent security and messaging integrations
- Strong typing and compile-time safety
- Battle-tested for enterprise workloads
- Excellent Kafka and JPA integration

### Why Kafka (not RabbitMQ / Spring Events)?
- Horizontal scalability for event streaming
- Message persistence and replay capability
- Consumer groups for parallel processing
- Decoupling booking processing from notification delivery
- Kafka is in-demand on resumes and real-world projects

### Why MySQL (not PostgreSQL)?
- Widely deployed and supported
- Excellent indexing capabilities for the booking query optimization requirement
- Better performance for read-heavy workloads with proper schema design
- Free tier availability on Render

### Why JWT + Redis?
- Stateless authentication at the API layer (JWT)
- Server-side session invalidation when needed (Redis blacklist)
- Refresh token rotation for security
- Scales horizontally without sticky sessions

### Why React on Vercel?
- Fast static deployment with global CDN
- Preview deployments for PR reviews
- Free tier covers the entire frontend
- React's ecosystem matches the team's skill set

## 4. Non-Functional Requirements

| Requirement | Target | How |
|------------|--------|-----|
| **Performance** | < 200ms p95 API response time | HikariCP connection pooling, Redis caching, MySQL indexing |
| **Availability** | 99.5% uptime | Render health checks, graceful degradation, retry logic |
| **Scalability** | 1000+ concurrent users | Kafka consumers, horizontal DB scaling, stateless API |
| **Security** | OWASP Top 10 compliance | Spring Security, JWT, input validation, CORS policy |
| **Data Integrity** | Zero double-bookings | Database unique constraints + optimistic locking |
| **Observability** | Structured logs + health checks | Logback with correlation IDs, actuator endpoints |

## 5. Constraints

| Constraint | Impact | Mitigation |
|-----------|--------|------------|
| Free-tier deployment | Limited resources | Optimize Docker images, use connection pooling |
| Single developer | Limited time | Focus on MVP first, then iterate |
| Kafka on free tier | Message rate limits | Batch processing, retry with backoff |
| MySQL free tier | 10K row limit | Efficient queries, archive old data |

## 6. Assumptions

1. **Internet connectivity** is available for all services
2. **Email delivery** will be mocked initially (no SMTP in dev)
3. **Payment processing** is out of scope for MVP (free events first)
4. **File uploads** (event images) will use a CDN URL, not local storage
5. **Kafka will run on a managed service** (Aiven, CloudKarafka) in production

## 7. Tech Debt & Future Considerations

- [ ] Replace MySQL with PostgreSQL if full-text search is needed
- [ ] Add Elasticsearch for complex event search
- [ ] Implement WebSocket for real-time capacity updates
- [ ] Add Prometheus + Grafana for metrics
- [ ] Implement distributed tracing with OpenTelemetry
- [ ] Add API versioning (v1/v2)
- [ ] Implement event sourcing for booking state changes
