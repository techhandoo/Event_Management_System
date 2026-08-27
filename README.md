# 🎫 FreeBuff — Event Management Platform

A full-stack event management platform built with **Spring Boot**, **React**, **Kafka**, and **PostgreSQL**. Users can register, authenticate, create and manage events, and handle event booking workflows with real-time notifications.

![Architecture](docs/architecture.md)
![API Docs](#api-documentation)

---

## ✨ Features

### Core
- 🔐 **JWT Authentication** with Spring Security (access + refresh tokens)
- 👥 **Role-based Authorization** (ADMIN, ORGANIZER, ATTENDEE)
- 📅 **Event CRUD** with create, update, publish, cancel workflows
- 🎟️ **Booking System** with capacity checks, duplicate prevention, and cancellation
- 🔍 **Event Search** with server-side filtering by city, category, and keywords

### Advanced
- 📨 **Kafka Messaging** — async event flows with producers, consumers, retry, and DLQ
- ⚡ **Redis Caching** — per-cache TTL for events, analytics, and user profiles
- 📊 **Analytics Dashboard** — platform-wide stats, revenue tracking, user management
- 🔔 **Notification Center** — real-time notifications with unread badge and mark-as-read
- 🐳 **Docker** — multi-stage builds, docker-compose with all 6 services

### Production
- 🧪 **Unit Tests** — JUnit 5 + Mockito for all services (14 test classes)
- 🔗 **Integration Tests** — Testcontainers with real PostgreSQL + Kafka
- 🚀 **CI/CD** — GitHub Actions pipeline (build → test → Docker → deploy)
- 🌐 **Deployment** — Render (backend) + Vercel (frontend)

---

## 🏗️ Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  React SPA   │────▶│  Spring Boot │────▶│ PostgreSQL 16 │
│  (Vite/TW)   │     │   (Java 17)  │     │              │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                    ┌───────┼───────┐
                    ▼       ▼       ▼
               ┌────────┐ ┌─────┐ ┌───────┐
               │ Kafka  │ │Redis│ │Flyway │
               │(3 topics)│     │ │(migration)│
               └────────┘ └─────┘ └───────┘
```

### Project Structure

```
event-manager/
├── backend/                          # Spring Boot API
│   ├── src/main/java/com/eventmanager/
│   │   ├── config/                   # Security, Redis, Kafka, CORS, OpenAPI
│   │   ├── controller/               # REST controllers (6 controllers, 26 endpoints)
│   │   ├── dto/                      # Request/Response DTOs
│   │   ├── exception/                # Global exception handling
│   │   ├── kafka/                    # Producers, consumers, events
│   │   ├── mapper/                   # Entity ↔ DTO mappers
│   │   ├── model/                    # JPA entities (User, Event, Booking, Notification)
│   │   ├── repository/               # Spring Data JPA repositories
│   │   ├── security/                 # JWT provider, filter, UserDetailsService
│   │   └── service/                  # Business logic (5 services)
│   ├── src/test/                     # Unit + PostgreSQL integration tests
│   ├── Dockerfile                    # Multi-stage build
│   └── pom.xml
├── frontend/                         # React SPA
│   ├── src/
│   │   ├── components/               # Navbar, NotificationCenter, ErrorBoundary
│   │   ├── context/                  # AuthContext
│   │   ├── pages/                    # 9 pages (Events, Dashboard, Admin, etc.)
│   │   ├── services/                 # Axios API client
│   │   └── types/                    # TypeScript definitions
│   ├── Dockerfile                    # Multi-stage (Node → Nginx)
│   └── nginx.conf                    # SPA routing + API proxy
├── docs/                             # Architecture, skills, scope, planning
├── docker-compose.yml                # 6 services
└── .github/workflows/ci-cd.yml       # CI/CD pipeline
```

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 20+
- Docker & Docker Compose
- Maven (or use `./mvnw`)

### 1. Start Infrastructure
```bash
docker-compose up -d postgres kafka zookeeper redis
```

### 2. Start Backend
```bash
cd backend
./mvnw spring-boot:run
```
Backend runs at `http://localhost:8080`

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173` (proxies to backend)

### 4. Or Run Everything with Docker
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

---

## 🧪 Testing

### Run Unit Tests
```bash
cd backend
./mvnw test
```

### Run Integration Tests (requires Docker)
```bash
cd backend
./mvnw test -Dtest=EventBookingIntegrationTest
```

---

## 📊 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI Spec**: `http://localhost:8080/v3/api-docs`

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT tokens |
| GET | `/api/events` | List events (paginated, filterable) |
| GET | `/api/events/search?q=` | Search events |
| POST | `/api/events` | Create event (ORGANIZER) |
| PUT | `/api/events/{id}/publish` | Publish event |
| POST | `/api/bookings` | Book event tickets |
| PUT | `/api/bookings/{id}/cancel` | Cancel booking |
| GET | `/api/notifications` | Get notifications |
| GET | `/api/admin/analytics` | Platform analytics (ADMIN) |

---

## 🔧 Environment Variables

### Backend (application.yml)
| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | dev secret | JWT signing key (256-bit min) |
| `SPRING_DATASOURCE_URL` | localhost:5432 | PostgreSQL connection URL |
| `SPRING_KAFKA_BOOTSTRAP_SERVERS` | localhost:9092 | Kafka broker |
| `SPRING_DATA_REDIS_HOST` | localhost | Redis host |

### Deployment (GitHub Actions Secrets)
| Secret | Description |
|--------|-------------|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password |
| `RENDER_SERVICE_ID` | Render service ID |
| `RENDER_API_KEY` | Render deploy key |
| `VERCEL_TOKEN` | Vercel deploy token |
| `VERCEL_ORG_ID` | Vercel org |
| `VERCEL_PROJECT_ID` | Vercel project |

---

## 📈 Project Stats

| Metric | Value |
|--------|-------|
| API Endpoints | 26 |
| Java Files | 61 |
| React Components | 19 |
| Docker Services | 6 |
| PostgreSQL Indexes | 8 composite |
| Kafka Topics | 4 |
| Test Files | 5 services + 1 integration |

---

## 📋 Documentation

| Document | Description |
|----------|-------------|
| [docs/skills.md](docs/skills.md) | Technology stack and skills |
| [docs/architecture.md](docs/architecture.md) | System architecture and design |
| [docs/context.md](docs/context.md) | Project context and decisions |
| [docs/scope.md](docs/scope.md) | Feature scope and user stories |
| [docs/planning.md](docs/planning.md) | Implementation roadmap |

---

## 📄 License

MIT License — Built with ❤️ for portfolio showcase.

---

**🤖 Generated with Codebuff**
