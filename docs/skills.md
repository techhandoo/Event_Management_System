# Skills & Technology Stack — Event Management Platform

## Core Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Backend Framework | Java + Spring Boot | Java 17 / Spring Boot 3.2+ | RESTful API development, DI, auto-configuration |
| Security | Spring Security + JWT | 6.x | Authentication, role-based authorization, session management |
| Messaging | Apache Kafka | 3.6+ | Async event processing, decoupled microservices communication |
| Database | MySQL | 8.0+ | Primary relational data store |
| ORM | Spring Data JPA / Hibernate | 6.x | Database abstraction, entity mapping, query generation |
| Cache | Redis | 7.x | Session storage, token blacklisting, hot data caching |
| API Docs | SpringDoc OpenAPI (Swagger) | 2.3+ | Interactive API documentation |
| Build Tool | Maven | 3.9+ | Dependency management, build lifecycle |

## Frontend

| Technology | Purpose |
|-----------|---------|
| React 18+ | SPA framework with hooks and context API |
| TypeScript | Type-safe development |
| React Router v6 | Client-side routing |
| Axios | HTTP client with interceptors |
| Tailwind CSS | Utility-first styling |
| React Hook Form | Form validation and management |

## DevOps & Deployment

| Tool | Purpose |
|------|---------|
| Docker | Containerization |
| Docker Compose | Local multi-service orchestration |
| Render / Vercel | Backend / Frontend deployment |
| GitHub Actions | CI/CD pipelines |

## Testing

| Tool | Purpose |
|------|---------|
| JUnit 5 | Unit and integration testing |
| Mockito | Mocking framework |
| Testcontainers | Integration testing with real Kafka/MySQL |
| Postman / Newman | API testing |
| Cypress | End-to-end testing (optional) |

## Key Skills Demonstrated

### Backend Engineering
- [x] RESTful API design following HATEOAS and Richardson Maturity Model
- [x] JWT authentication with access/refresh token pattern
- [x] Role-based access control (ADMIN, ORGANIZER, ATTENDEE)
- [x] Global exception handling with `@ControllerAdvice`
- [x] Request validation with Bean Validation (`@Valid`, `@NotNull`, etc.)
- [x] DTO pattern to decouple API contracts from entities
- [x] Pagination and sorting for large result sets
- [x] Database migration with Flyway

### Kafka & Messaging
- [x] Producer/Consumer pattern implementation
- [x] Topic partitioning and consumer groups
- [x] Event-driven architecture for booking workflows
- [x] Idempotent message consumption
- [x] Dead letter queue handling for failed messages
- [x] Kafka event schemas (Avro or JSON Schema)

### Database & Performance
- [x] MySQL schema design with normalization (3NF)
- [x] Composite indexes for booking query optimization
- [x] Connection pooling with HikariCP
- [x] Query performance analysis and optimization
- [x] Foreign key constraints and cascading behaviors

### Frontend Engineering
- [x] Component-based architecture with reusable UI
- [x] Protected routes with auth context
- [x] Optimistic UI updates for booking actions
- [x] Responsive design for mobile/tablet/desktop
- [x] Error boundaries and loading states

### Architecture & Design Patterns
- [x] Layered architecture (Controller → Service → Repository)
- [x] Event-driven architecture with Kafka
- [x] CQRS-lite for read-heavy booking queries
- [x] Outbox pattern for reliable Kafka publishing
- [x] Circuit breaker pattern for external service calls

### DevOps
- [x] Multi-stage Docker builds for optimized images
- [x] Environment-based configuration with profiles
- [x] Health check endpoints for monitoring
- [x] Structured logging with correlation IDs
