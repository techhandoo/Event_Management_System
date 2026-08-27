@echo off
REM ═══════════════════════════════════════════════════════════════
REM Eventry — Local Development Startup Script (Windows)
REM Starts PostgreSQL + Kafka + Redis via Docker, then the backend
REM ═══════════════════════════════════════════════════════════════

echo.
echo ======================================
echo   Eventry — Starting Local Development
echo ======================================
echo.

REM ─── Step 1: Start infrastructure ──────────────────────────
echo [1/5] Starting PostgreSQL, Kafka, Zookeeper, Redis...
docker-compose up -d postgres zookeeper kafka redis

echo [2/5] Waiting for PostgreSQL to be healthy...
:wait_pg
docker-compose exec -T postgres pg_isready -U postgres >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 2 /nobreak >nul
    goto wait_pg
)
echo   OK - PostgreSQL is ready

echo [3/5] Waiting for Kafka to be healthy...
:wait_kafka
docker-compose exec -T kafka kafka-broker-api-versions --bootstrap-server localhost:9092 >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 3 /nobreak >nul
    goto wait_kafka
)
echo   OK - Kafka is ready

echo [4/5] Waiting for Redis to be healthy...
:wait_redis
docker-compose exec -T redis redis-cli ping >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 2 /nobreak >nul
    goto wait_redis
)
echo   OK - Redis is ready

echo [5/5] Starting Spring Boot backend...
echo.
cd backend
call mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
cd ..

echo.
echo ======================================
echo   Backend running on http://localhost:8080
echo   Health:  http://localhost:8080/api/health
echo   Uptime:  http://localhost:8080/api/uptime
echo   Swagger: http://localhost:8080/swagger-ui.html
echo ======================================
