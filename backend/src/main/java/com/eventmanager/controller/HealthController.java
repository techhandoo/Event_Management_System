package com.eventmanager.controller;

import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.ListTopicsResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaAdmin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

@RestController
public class HealthController {

    private static final Logger log = LoggerFactory.getLogger(HealthController.class);

    private final DataSource dataSource;
    private final StringRedisTemplate redisTemplate;
    private final KafkaAdmin kafkaAdmin;

    public HealthController(DataSource dataSource,
                            StringRedisTemplate redisTemplate,
                            KafkaAdmin kafkaAdmin) {
        this.dataSource = dataSource;
        this.redisTemplate = redisTemplate;
        this.kafkaAdmin = kafkaAdmin;
    }

    /**
     * Deep health check — verifies DB, Redis, Kafka connectivity.
     * Used by UptimeRobot or any monitoring service.
     * Returns 200 only if ALL dependencies are reachable.
     */
    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("service", "eventry-api");
        health.put("timestamp", Instant.now().toString());

        Map<String, String> dependencies = new LinkedHashMap<>();

        // Check PostgreSQL
        try (Connection conn = dataSource.getConnection()) {
            if (conn.isValid(3)) {
                dependencies.put("database", "UP");
            } else {
                dependencies.put("database", "DOWN");
                health.put("status", "DEGRADED");
            }
        } catch (Exception e) {
            log.warn("Health check: database DOWN - {}", e.getMessage());
            dependencies.put("database", "DOWN: " + e.getMessage());
            health.put("status", "DOWN");
        }

        // Check Redis
        try {
            String pong = redisTemplate.getConnectionFactory().getConnection().ping();
            if ("PONG".equalsIgnoreCase(pong)) {
                dependencies.put("redis", "UP");
            } else {
                dependencies.put("redis", "DOWN");
                health.put("status", "DEGRADED");
            }
        } catch (Exception e) {
            log.warn("Health check: redis DOWN - {}", e.getMessage());
            dependencies.put("redis", "DOWN: " + e.getMessage());
            health.put("status", "DOWN");
        }

        // Check Kafka via AdminClient
        try (AdminClient adminClient = AdminClient.create(kafkaAdmin.getConfig())) {
            ListTopicsResult topics = adminClient.listTopics();
            Set<String> names = topics.names().get();
            dependencies.put("kafka", "UP (topics: " + names.size() + ")");
        } catch (Exception e) {
            log.warn("Health check: kafka DOWN - {}", e.getMessage());
            dependencies.put("kafka", "DOWN: " + e.getMessage());
            health.put("status", "DEGRADED");
        }

        health.put("dependencies", dependencies);

        if ("DOWN".equals(health.get("status"))) {
            return ResponseEntity.status(503).body(health);
        }
        return ResponseEntity.ok(health);
    }

    /**
     * Simple uptime ping — lightweight, no dependency checks.
     * Returns 200 always (if the process is alive).
     * Use this for UptimeRobot basic ping checks.
     */
    @GetMapping("/api/uptime")
    public ResponseEntity<Map<String, Object>> uptime() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "eventry-api",
                "timestamp", Instant.now().toString(),
                "uptime", "alive"
        ));
    }
}
