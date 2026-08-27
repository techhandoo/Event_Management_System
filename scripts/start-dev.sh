#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Eventry — Local Development Startup Script
# Starts PostgreSQL + Kafka + Redis via Docker, then the backend
# ═══════════════════════════════════════════════════════════════

set -e

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  Eventry — Starting Local Development           ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ─── Step 1: Start infrastructure ──────────────────────────
echo "[1/5] Starting PostgreSQL, Kafka, Zookeeper, Redis..."
docker-compose up -d postgres zookeeper kafka redis

echo "[2/5] Waiting for PostgreSQL to be healthy..."
until docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
    sleep 2
done
echo "  ✓ PostgreSQL is ready"

echo "[3/5] Waiting for Kafka to be healthy..."
until docker-compose exec -T kafka kafka-broker-api-versions --bootstrap-server localhost:9092 > /dev/null 2>&1; do
    sleep 2
done
echo "  ✓ Kafka is ready"

echo "[4/5] Waiting for Redis to be healthy..."
until docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do
    sleep 2
done
echo "  ✓ Redis is ready"

echo "[5/5] Starting Spring Boot backend (Flyway will auto-migrate)..."
echo ""
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev &

BACKEND_PID=$!
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  Backend starting on http://localhost:8080       ║"
echo "║  Flyway will run V1 + V2 migrations on startup  ║"
echo "║                                                  ║"
echo "║  Health:  http://localhost:8080/api/health       ║"
echo "║  Uptime:  http://localhost:8080/api/uptime       ║"
echo "║  Swagger: http://localhost:8080/swagger-ui.html  ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "Press Ctrl+C to stop all services."
echo ""

# Wait for backend to be ready
echo "Waiting for backend to start..."
until curl -s http://localhost:8080/api/health > /dev/null 2>&1; do
    sleep 3
done
echo ""
echo "✓ Backend is UP — all services running!"
echo ""

# Test endpoints
echo "=== Testing /api/health ==="
curl -s http://localhost:8080/api/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8080/api/health
echo ""

echo "=== Testing /api/uptime ==="
curl -s http://localhost:8080/api/uptime | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8080/api/uptime
echo ""

echo "=== Testing seed users ==="
echo "Login as admin:"
curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eventry.app","password":"admin123456"}' | python3 -m json.tool 2>/dev/null || echo "(install python3 for pretty JSON)"
echo ""

# Cleanup on exit
trap "echo ''; echo 'Stopping services...'; kill $BACKEND_PID 2>/dev/null; docker-compose down; echo 'Done.'" EXIT

wait $BACKEND_PID
