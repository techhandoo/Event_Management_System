#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Eventry — Verify Uptime Endpoints Before Adding to UptimeRobot
# Run this AFTER starting the backend to confirm endpoints work
# ═══════════════════════════════════════════════════════════════

set -e

BACKEND_URL="${1:-http://localhost:8080}"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  Eventry — Uptime Endpoint Verification          ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "Testing against: $BACKEND_URL"
echo ""

# ─── Test /api/uptime (lightweight ping) ─────────────────
echo "─── Test 1: GET /api/uptime (lightweight ping) ───"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BACKEND_URL/api/uptime" 2>&1)
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

if [ "$HTTP_STATUS" = "200" ]; then
    echo "  ✓ Status: $HTTP_STATUS (UP)"
    echo "  Response: $BODY"
    UPTIME_OK=true
else
    echo "  ✗ Status: $HTTP_STATUS (DOWN)"
    echo "  Response: $BODY"
    UPTIME_OK=false
fi
echo ""

# ─── Test /api/health (deep health check) ────────────────
echo "─── Test 2: GET /api/health (deep health check) ───"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BACKEND_URL/api/health" 2>&1)
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

if [ "$HTTP_STATUS" = "200" ]; then
    echo "  ✓ Status: $HTTP_STATUS (UP)"
    echo "  Response: $BODY"
    HEALTH_OK=true
elif [ "$HTTP_STATUS" = "503" ]; then
    echo "  ⚠ Status: $HTTP_STATUS (DEGRADED — some dependencies down)"
    echo "  Response: $BODY"
    HEALTH_OK=false
else
    echo "  ✗ Status: $HTTP_STATUS (DOWN)"
    echo "  Response: $BODY"
    HEALTH_OK=false
fi
echo ""

# ─── Summary ─────────────────────────────────────────────
echo "═══════════════════════════════════════════════════"
if [ "$UPTIME_OK" = true ] && [ "$HEALTH_OK" = true ]; then
    echo "  ✓ ALL ENDPOINTS READY FOR UPTIMEROBOT"
    echo ""
    echo "  UptimeRobot monitor URLs:"
    echo "    Ping:   $BACKEND_URL/api/uptime"
    echo "    Health: $BACKEND_URL/api/health"
elif [ "$UPTIME_OK" = true ]; then
    echo "  ⚠ /api/uptime is ready, but /api/health has issues"
    echo "    You can still add the uptime monitor"
else
    echo "  ✗ Endpoints not ready. Start the backend first."
    echo "    Run: cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev"
fi
echo "═══════════════════════════════════════════════════"
echo ""
