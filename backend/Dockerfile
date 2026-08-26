# ═══════════════════════════════════════════════════════════════
# Stage 1: Build with Maven
# ═══════════════════════════════════════════════════════════════
FROM eclipse-temurin:17-jdk-jammy AS build

WORKDIR /app

# Cache Maven dependencies first (layer caching optimization)
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN ./mvnw package -DskipTests -B

# ═══════════════════════════════════════════════════════════════
# Stage 2: Run with JRE (smaller image)
# ═══════════════════════════════════════════════════════════════
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Create non-root user for security
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Copy the built JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
