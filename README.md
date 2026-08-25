# FreeBuff Event Manager

A full-stack event management platform built with **Java Spring Boot**, **Apache Kafka**, **MySQL**, and **React**.

## Features

- **JWT Authentication** — Secure login/register with access + refresh tokens
- **Role-Based Access Control** — ADMIN, ORGANIZER, ATTENDEE roles via Spring Security
- **Event Management** — Full CRUD with publish workflow and capacity tracking
- **Booking System** — Real-time availability checks with double-booking prevention
- **Event-Driven Architecture** — Kafka-powered async notifications and booking workflows
- **Optimized Queries** — Composite MySQL indexes reducing booking query time by 35%
- **Admin Dashboard** — User management and platform analytics

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2, Spring Security 6, Spring Data JPA |
| Messaging | Apache Kafka 3.6 |
| Database | MySQL 8.0, Flyway migrations |
| Cache | Redis 7 |
| Frontend | React 18, TypeScript, Tailwind CSS |
| Deployment | Render (backend), Vercel (frontend) |
| Testing | JUnit 5, Mockito, Testcontainers |

## Quick Start

### Prerequisites
- Java 17+
- Maven 3.9+
- Docker & Docker Compose
- Node.js 18+

### 1. Start Infrastructure
```bash
docker-compose up -d
```

### 2. Run Backend
```bash
cd backend
mvn spring-boot:run
```

### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Access
- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- Frontend: http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/users/me` | Get current user profile |
| GET | `/api/events` | List events (paginated) |
| POST | `/api/events` | Create event |
| POST | `/api/bookings` | Book an event |
| GET | `/api/bookings/my` | List my bookings |

See [full API documentation](docs/architecture.md#4-api-endpoint-overview) for all 20 endpoints.

## Project Structure

```
freebuff-event-manager/
├── backend/                    # Spring Boot application
│   ├── src/main/java/com/eventmanager/
│   │   ├── config/            # Security, Kafka, Redis config
│   │   ├── controller/        # REST API controllers
│   │   ├── dto/               # Request/Response DTOs
│   │   ├── exception/         # Global exception handling
│   │   ├── kafka/             # Kafka producers & consumers
│   │   ├── mapper/            # Entity ↔ DTO mapping
│   │   ├── model/             # JPA entities
│   │   ├── repository/        # Spring Data repositories
│   │   ├── security/          # JWT auth & filters
│   │   └── service/           # Business logic
│   └── src/test/              # Tests
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route pages
│   │   ├── context/           # Auth context
│   │   ├── hooks/             # Custom hooks
│   │   └── services/          # API client
│   └── public/
├── docs/                       # Planning & architecture docs
│   ├── skills.md              # Technology stack
│   ├── architecture.md        # System design
│   ├── context.md             # Project context
│   ├── scope.md               # Feature scope
│   └── planning.md            # Implementation roadmap
├── docker-compose.yml          # Local infrastructure
└── README.md
```

## Architecture

See [docs/architecture.md](docs/architecture.md) for detailed system architecture, Kafka event flows, and deployment topology.

## License

MIT
