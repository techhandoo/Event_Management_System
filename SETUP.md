# Eventry — Local Development Setup Guide

## Prerequisites

You need these installed on your machine:

| Tool | Install |
|------|---------|
| **Docker Desktop** | https://www.docker.com/products/docker-desktop/ |
| **Java 17+** | https://adoptium.net/ (Temurin JDK 17) |
| **Node.js 20+** | https://nodejs.org/ |

---

## Step 1: Start Infrastructure (PostgreSQL + Kafka + Redis)

Open a terminal in the project root:

```bash
docker-compose up -d postgres zookeeper kafka redis
```

Wait ~30 seconds for all services to be healthy. Verify:

```bash
docker-compose ps
```

You should see all 4 services with `(healthy)` status.

### What this creates:
- **PostgreSQL 16** on port `5432` (database: `eventry`, user: `postgres`, password: `postgres`)
- **Kafka** on port `9092`
- **Zookeeper** on port `2181`
- **Redis** on port `6379`

---

## Step 2: Start the Backend

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

On Windows:
```bash
cd backend
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```

### What happens on startup:
1. Spring Boot connects to PostgreSQL at `localhost:5432/eventry`
2. **Flyway** runs `V1__create_initial_schema.sql` (creates tables + seed data)
3. **Flyway** runs `V2__add_password_reset_fields.sql` (adds reset token columns)
4. Kafka topics are auto-created
5. Backend starts on `http://localhost:8080`

### You should see:
```
Flyway: Successfully applied 2 migrations to schema "public"
Started EventManagerApplication in X seconds
```

---

## Step 3: Verify Everything Works

### Health check (deep — checks DB, Redis, Kafka):
```bash
curl http://localhost:8080/api/health
```

Expected response:
```json
{
  "status": "UP",
  "service": "eventry-api",
  "dependencies": {
    "database": "UP",
    "redis": "UP",
    "kafka": "UP (topics: 4)"
  }
}
```

### Uptime ping (lightweight):
```bash
curl http://localhost:8080/api/uptime
```

### Login with seed users:
```bash
# Admin
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eventry.app","password":"admin123456"}'

# Organizer
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"organizer@eventry.app","password":"organizer123456"}'

# Attendee
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"attendee@eventry.app","password":"attendee123456"}'
```

---

## Step 4: Start the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api` to the backend.

---

## Step 5: Open UptimeRobot

1. Go to https://uptimerobot.com
2. Sign up (free — 50 monitors)
3. Add monitor → **HTTP(s)**
4. **Friendly Name:** `Eventry API Health`
5. **URL:** `http://localhost:8080/api/health` (local) or `https://your-api.onrender.com/api/health` (production)
6. **Monitoring Interval:** 5 minutes
7. Save

---

## Troubleshooting

### "Connection refused" on port 5432
PostgreSQL isn't running. Check:
```bash
docker-compose ps postgres
docker-compose logs postgres
```

### Flyway migration fails
Database already has tables. Reset it:
```bash
docker-compose down -v    # ⚠️ Deletes all data
docker-compose up -d postgres
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Kafka won't start
Check logs:
```bash
docker-compose logs kafka
```
Common issue: Zookeeper not ready yet. Restart:
```bash
docker-compose restart kafka
```

### Backend can't connect to Kafka
Wait 10 seconds after Kafka starts. Kafka takes longer than PostgreSQL to be ready.

---

## Stop Everything

```bash
# Stop backend: Ctrl+C in the backend terminal

# Stop infrastructure:
docker-compose down

# Stop and delete all data:
docker-compose down -v
```
