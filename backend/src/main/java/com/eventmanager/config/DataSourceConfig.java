package com.eventmanager.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import java.net.URI;

/**
 * Configures the DataSource from environment variables.
 * Handles Render's DATABASE_URL format (postgresql://user:pass@host:port/db)
 * by prepending jdbc: if needed and extracting credentials.
 */
@Configuration
@Profile("prod")
public class DataSourceConfig {

    @Value("${DATABASE_URL:${SPRING_DATASOURCE_URL:}}")
    private String databaseUrl;

    @Value("${SPRING_DATASOURCE_USERNAME:}")
    private String explicitUsername;

    @Value("${SPRING_DATASOURCE_PASSWORD:}")
    private String explicitPassword;

    @Primary
    @Bean
    public DataSource dataSource() {
        String url = databaseUrl;
        if (url == null || url.isEmpty()) {
            url = "jdbc:postgresql://localhost:5432/eventry";
        }

        String jdbcUrl = buildJdbcUrl(url);
        String user = explicitUsername;
        String pass = explicitPassword;

        // If no explicit credentials, try to extract from URL
        // Render's DATABASE_URL: postgresql://user:pass@host:port/db
        if ((user == null || user.isEmpty()) && url.contains("@")) {
            try {
                // Remove jdbc: prefix if present for URI parsing
                String cleanUrl = url.startsWith("jdbc:") ? url.substring(5) : url;
                URI uri = new URI(cleanUrl);
                user = uri.getUserInfo();
                if (user != null && user.contains(":")) {
                    pass = user.substring(user.indexOf(":") + 1);
                    user = user.substring(0, user.indexOf(":"));
                }
            } catch (Exception e) {
                // Fall through — let HikariCP handle it
            }
        }

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl);
        config.setDriverClassName("org.postgresql.Driver");

        if (user != null && !user.isEmpty()) {
            config.setUsername(user);
        }
        if (pass != null && !pass.isEmpty()) {
            config.setPassword(pass);
        }

        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(300000);
        config.setConnectionTimeout(20000);
        config.setMaxLifetime(1200000);

        return new HikariDataSource(config);
    }

    private String buildJdbcUrl(String url) {
        if (url.startsWith("jdbc:")) {
            return url;
        }
        if (url.startsWith("postgresql://")) {
            return "jdbc:" + url;
        }
        return url;
    }
}
