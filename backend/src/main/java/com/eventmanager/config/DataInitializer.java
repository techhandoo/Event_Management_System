package com.eventmanager.config;

import com.eventmanager.model.User;
import com.eventmanager.model.enums.Role;
import com.eventmanager.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds default users on first startup if they don't already exist.
 * Uses the actual PasswordEncoder to generate proper BCrypt hashes.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUser("admin@eventry.app", "admin123456", "Admin User", Role.ADMIN);
        seedUser("organizer@eventry.app", "organizer123456", "John Organizer", Role.ORGANIZER);
        seedUser("attendee@eventry.app", "attendee123456", "Jane Attendee", Role.ATTENDEE);
    }

    private void seedUser(String email, String password, String fullName, Role role) {
        userRepository.findByEmail(email).ifPresentOrElse(
            // User exists — update password hash in case migration had a bad hash
            user -> {
                String correctHash = passwordEncoder.encode(password);
                if (!passwordEncoder.matches(password, user.getPasswordHash())) {
                    user.setPasswordHash(correctHash);
                    userRepository.save(user);
                    log.info("Fixed password for {} user: {}", role, email);
                }
            },
            // User doesn't exist — create it
            () -> {
                User user = User.builder()
                        .email(email)
                        .passwordHash(passwordEncoder.encode(password))
                        .fullName(fullName)
                        .role(role)
                        .isActive(true)
                        .build();
                userRepository.save(user);
                log.info("Seeded {} user: {}", role, email);
            }
        );
    }
}
