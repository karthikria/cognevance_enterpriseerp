
package com.cognevaance.enterpriseerp;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.cognevaance.enterpriseerp.entity.User;
import com.cognevaance.enterpriseerp.repository.UserRepository;

@Configuration
public class AdminInitializer {

    @Bean
    CommandLineRunner createAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.name:Administrator}") String adminName,
            @Value("${app.admin.email}") String adminEmail,
            @Value("${app.admin.password}") String adminPassword) {

        return args -> {
            if (userRepository.findByEmail(adminEmail).isEmpty()) {

                User admin = new User();
                admin.setName(adminName);
                admin.setEmail(adminEmail);
                admin.setPassword(
                    passwordEncoder.encode(adminPassword)
                );
                admin.setRole("ADMIN");

                userRepository.save(admin);

                System.out.println("Initial Admin account created.");
            } else {
                System.out.println(
                    "Admin email already exists; no account changes made."
                );
            }
        };
    }
}
