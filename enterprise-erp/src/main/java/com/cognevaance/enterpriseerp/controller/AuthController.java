
package com.cognevaance.enterpriseerp.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import com.cognevaance.enterpriseerp.dto.LoginRequest;
import com.cognevaance.enterpriseerp.entity.User;
import com.cognevaance.enterpriseerp.service.UserService;
import java.util.Map;
import com.cognevaance.enterpriseerp.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.security.core.context.SecurityContextHolder;
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    public AuthController(
            UserService userService,
            AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody User user) {

        userService.registerUser(user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body("Registration successful");
    }

//    @PostMapping("/login")
//    public ResponseEntity<String> login(
//            @RequestBody LoginRequest request) {
//
//        try {
//            Authentication authentication =
//                    authenticationManager.authenticate(
//                        new UsernamePasswordAuthenticationToken(
//                            request.getEmail(),
//                            request.getPassword()
//                        )
//                    );
//
//            if (authentication.isAuthenticated()) {
//                return ResponseEntity.ok("Login successful");
//            }
//
//            return ResponseEntity
//                    .status(HttpStatus.UNAUTHORIZED)
//                    .body("Invalid email or password");
//
//        } catch (AuthenticationException exception) {
//            return ResponseEntity
//                    .status(HttpStatus.UNAUTHORIZED)
//                    .body("Invalid email or password");
//        }
//    }
    

@PostMapping("/login")
public ResponseEntity<?> login(
        @RequestBody LoginRequest request) {

    try {
        Authentication authentication =
                authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                    )
                );

        if (authentication.isAuthenticated()) {
            String email = authentication.getName();

            String role = authentication.getAuthorities()
                    .stream()
                    .findFirst()
                    .map(authority ->
                            authority.getAuthority()
                                    .replace("ROLE_", ""))
                    .orElse("EMPLOYEE");

            String token = jwtService.generateToken(email, role);

            return ResponseEntity.ok(
                Map.of(
                    "message", "Login successful",
                    "token", token,
                    "email", email,
                    "role", role
                )
            );
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid email or password");

    } catch (AuthenticationException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid email or password");
    }
}
public static class ChangePasswordRequest {
    private String currentPassword;
    private String newPassword;

    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}

@PostMapping("/change-password")
public ResponseEntity<?> changePassword(
        @RequestBody ChangePasswordRequest request) {

    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null
            || !authentication.isAuthenticated()
            || authentication.getPrincipal().equals("anonymousUser")) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Please sign in first"));
    }

    try {
        userService.changePassword(
                authentication.getName(),
                request.getCurrentPassword(),
                request.getNewPassword());

        return ResponseEntity.ok(
                Map.of("message", "Password changed successfully"));

    } catch (IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", ex.getMessage()));
    }
}
public static class ProfileUpdateRequest {
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
@GetMapping("/profile")
public ResponseEntity<?> getProfile() {
    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null
            || !authentication.isAuthenticated()
            || authentication.getPrincipal().equals("anonymousUser")) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Please sign in first"));
    }

    try {
        User user = userService.getUserProfile(authentication.getName());

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole()
        ));
    } catch (IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", ex.getMessage()));
    }
}

@PutMapping("/profile")
public ResponseEntity<?> updateProfile(
        @RequestBody ProfileUpdateRequest request) {

    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null
            || !authentication.isAuthenticated()
            || authentication.getPrincipal().equals("anonymousUser")) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Please sign in first"));
    }

    try {
        User user = userService.updateProfileName(
                authentication.getName(),
                request.getName()
        );

        return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully",
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole()
        ));
    } catch (IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", ex.getMessage()));
    }
}


}
