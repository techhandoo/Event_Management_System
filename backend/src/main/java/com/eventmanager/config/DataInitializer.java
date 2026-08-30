package com.eventmanager.config;

import com.eventmanager.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Logs user count on startup for visibility.
 * All user creation goes through the registration API — no hardcoded seed data.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;

    public DataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        long count = userRepository.count();
        log.info("Database has {} user(s) — no seed data injected", count);
    }
}
