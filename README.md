

A full-stack event management platform built with **Spring Boot 3**, **React 18**, **Kafka**, and **PostgreSQL**. Users can register, authenticate, create and manage events, handle bookings with Razorpay payments, and receive real-time notifications.

---

## ✨ Features

### Authentication & Security
- 🔐 **JWT Authentication** with access + refresh tokens
- 👥 **Role-based Authorization** (ADMIN, ORGANIZER, ATTENDEE)
- 🛡️ **Rate Limiting** on auth endpoints (5 login/min, 3 register/min)
- 🔒 **Security Headers** — CSP, HSTS, X-Frame-Options, Referrer-Policy
- 🔑 **Cryptographically Secure** password reset tokens (256-bit SecureRandom)
- 🚫 **Account Lockout Protection** — rate-limited login attempts

### Event Management
- 📅 **Event CRUD** with create, update, publish, cancel workflows
- 🔍 **Event Search** with server-side filtering by city, category, and keywords
- 📊 **Organizer Dashboard** — event stats, revenue tracking, analytics
- 🎯 **Capacity Management** with pessimistic row locking (SELECT FOR UPDATE)

### Booking & Payments
- 🎟️ **Booking System** with capacity checks, duplicate prevention, and cancellation
- 💳 **Razorpay Integration** — secure payment processing for paid events
- 🔒 **Pessimistic Row Locking** — prevents race conditions on concurrent bookings
- 📱 **Payment Status Tracking** — real-time payment confirmation

### Notifications & Messaging
- 🔔 **Notification Center** — real-time notifications with unread badge
- 📨 **Kafka Messaging** — async event flows with producers, consumers, retry, and DLQ
- ⚡ **Redis Caching** — per-cache TTL for events, analytics, and user profiles

### Admin & Analytics
- 📊 **Admin Dashboard** — platform-wide stats, user management
- 👥 **User Management** — role changes, ban/unban, user details
- 📈 **Analytics** — total users, events, bookings, revenue tracking

### Production Ready
- 🧪 **Unit Tests** — JUnit 5 + Mockito for all services
- 🔗 **Integration Tests** — Testcontainers with real PostgreSQL + Kafka
- 🚀 **CI/CD** — GitHub Actions pipeline (build → test → deploy)
- 🌐 **Deployment** — Render (backend) + Vercel (frontend)
- 🐳 **Docker** — multi-stage builds, docker-compose with all services

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
eventry/
├── backend/                          # Spring Boot API
│   ├── src/main/java/com/eventmanager/
│   │   ├── config/                   # Security, Redis, Kafka, CORS, Razorpay
│   │   ├── controller/               # REST controllers (8 controllers, 30+ endpoints)
│   │   ├── dto/                      # Request/Response DTOs with validation
│   │   ├── exception/                # Global exception handling
│   │   ├── kafka/                    # Producers, consumers, events
│   │   ├── mapper/                   # Entity ↔ DTO mappers
│   │   ├── model/                    # JPA entities (User, Event, Booking, Notification)
│   │   ├── repository/               # Spring Data JPA repositories
│   │   ├── security/                 # JWT, rate limiting, UserDetailsService
│   │   └── service/                  # Business logic (7 services)
│   ├── src/test/                     # Unit + integration tests
│   ├── Dockerfile                    # Multi-stage build
│   └── pom.xml
├── frontend/                         # React SPA
│   ├── src/
│   │   ├── components/               # Sidebar, TopBar, NotificationCenter, UI components
│   │   ├── context/                  # AuthContext, SidebarContext
│   │   ├── pages/                    # 15+ pages (Events, Dashboard, Admin, Profile, etc.)
│   │   ├── services/                 # Axios API client with interceptors
│   │   └── types/                    # TypeScript definitions
│   ├── tailwind.config.js            # Custom design system
│   └── vite.config.ts
├── docs/                             # Architecture, planning, context
├── docker-compose.yml                # Services
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
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| GET | `/api/events` | List events (paginated, filterable) |
| GET | `/api/events/search?q=` | Search events |
| POST | `/api/events` | Create event (ORGANIZER) |
| PUT | `/api/events/{id}` | Update event |
| PUT | `/api/events/{id}/publish` | Publish event |
| POST | `/api/bookings` | Book event tickets |
| PUT | `/api/bookings/{id}/cancel` | Cancel booking |
| GET | `/api/bookings/my` | Get my bookings |
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/me` | Update profile |
| PUT | `/api/users/me/email` | Change email |
| PUT | `/api/users/me/password` | Change password |
| GET | `/api/notifications` | Get notifications |
| GET | `/api/admin/analytics` | Platform analytics (ADMIN) |
| GET | `/api/admin/users` | List users (ADMIN) |
| PUT | `/api/admin/users/{id}/role` | Change user role (ADMIN) |
| PUT | `/api/admin/users/{id}/ban` | Ban/unban user (ADMIN) |
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment |
| GET | `/api/health` | Health check (DB, Redis, Kafka) |
| GET | `/api/uptime` | Uptime ping |

---

## 🔧 Environment Variables

### Backend (application.yml)
| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | — | JWT signing key (256-bit min, required) |
| `SPRING_DATASOURCE_URL` | localhost:5432 | PostgreSQL connection URL |
| `SPRING_DATASOURCE_USERNAME` | postgres | PostgreSQL username |
| `SPRING_DATASOURCE_PASSWORD` | postgres | PostgreSQL password |
| `SPRING_KAFKA_BOOTSTRAP_SERVERS` | localhost:9092 | Kafka broker |
| `SPRING_DATA_REDIS_HOST` | localhost | Redis host |
| `RAZORPAY_KEY_ID` | — | Razorpay API key (optional) |
| `RAZORPAY_KEY_SECRET` | — | Razorpay API secret (optional) |
| `ADMIN_SEED_KEY` | — | One-time admin creation key |
| `RESEND_API_KEY` | — | Email service API key (optional) |

### Frontend
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (default: `https://eventry-api.onrender.com/api`) |

---

## 📈 Project Stats

| Metric | Value |
|--------|-------|
| API Endpoints | 30+ |
| Java Files | 65+ |
| React Components | 20+ |
| Pages | 15+ |
| Database Migrations | 4 |
| PostgreSQL Indexes | 8 composite |
| Kafka Topics | 4 |
| Security Features | Rate limiting, CSP, JWT, RBAC |
| Payment Integration | Razorpay |

---

## 🔒 Security Features

- **JWT Authentication** — Access tokens (15 min) + Refresh tokens (7 days)
- **Rate Limiting** — Auth endpoints limited to prevent brute force
- **Security Headers** — CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy
- **Input Validation** — Jakarta Bean Validation on all DTOs
- **SQL Injection Prevention** — Parameterized queries via JPA/Hibernate
- **XSS Prevention** — React auto-escaping, CSP headers
- **CORS Configuration** — Whitelisted origins only
- **Password Hashing** — BCrypt with cost factor 10
- **Pessimistic Row Locking** — SELECT FOR UPDATE on booking capacity
- **Self-Protection** — Admins cannot ban or demote themselves

---

## 📋 Documentation

| Document | Description |
|----------|-------------|
| [docs/architecture.md](docs/architecture.md) | System architecture and design |
| [docs/context.md](docs/context.md) | Project context and decisions |
| [docs/scope.md](docs/scope.md) | Feature scope and user stories |
| [docs/planning.md](docs/planning.md) | Implementation roadmap |

---

## 📄 License
