
package com.cognevaance.enterpriseerp.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.cognevaance.enterpriseerp.entity.User;
import com.cognevaance.enterpriseerp.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User user) {

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException(
                "Email is already registered"
            );
        }

        user.setId(null);
        user.setPassword(
            passwordEncoder.encode(user.getPassword())
        );

        user.setRole("EMPLOYEE");

        return userRepository.save(user);
    }
    public void changePassword(
            String email,
            String currentPassword,
            String newPassword) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User account not found"));

        if (!passwordEncoder.matches(
                currentPassword, user.getPassword())) {
            throw new IllegalArgumentException(
                    "Current password is incorrect");
        }

        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException(
                    "New password must contain at least 8 characters");
        }

        if (passwordEncoder.matches(
                newPassword, user.getPassword())) {
            throw new IllegalArgumentException(
                    "New password must differ from current password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
    public User getUserProfile(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User account not found"));
    }

    public User updateProfileName(String email, String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Name cannot be empty");
        }

        if (name.trim().length() > 100) {
            throw new IllegalArgumentException("Name cannot exceed 100 characters");
        }

        User user = getUserProfile(email);
        user.setName(name.trim());

        return userRepository.save(user);
    }
}
