package com.smartride.user.controller;

import com.smartride.user.model.User;
import com.smartride.user.repository.UserRepository;
import com.smartride.user.service.KeycloakSyncService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;
    private final KeycloakSyncService keycloakSyncService;

    public UserController(UserRepository userRepository, KeycloakSyncService keycloakSyncService) {
        this.userRepository = userRepository;
        this.keycloakSyncService = keycloakSyncService;
    }

    @GetMapping("/health")
    public String health() {
        return "User Service is up and running!";
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody Map<String, Object> payload) {
        return processCreation(payload);
    }

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody Map<String, Object> payload) {
        return processCreation(payload);
    }

    private ResponseEntity<User> processCreation(Map<String, Object> payload) {
        String email = (String) payload.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        // Check if user exists
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(existing.get());
        }

        String name = (String) payload.get("name");
        String firstName = (String) payload.get("firstName");
        String lastName = (String) payload.get("lastName");

        if (firstName == null && name != null) {
            String[] parts = name.trim().split(" ");
            firstName = parts[0];
            lastName = parts.length > 1 ? String.join(" ", Arrays.copyOfRange(parts, 1, parts.length)) : "";
        }

        String username = (String) payload.get("username");
        if (username == null || username.isBlank()) {
            username = email.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "_").toLowerCase();
        }

        String phone = (String) payload.get("phone");
        String role = (String) payload.get("role");
        String status = (String) payload.get("status");
        String password = (String) payload.get("password");

        User user = new User(
                username,
                email,
                firstName != null ? firstName : "SmartRide",
                lastName != null ? lastName : "User",
                phone != null ? phone : "+216 00 000 000",
                role != null ? role : "PASSAGER",
                status != null ? status : "ACTIF"
        );

        User saved = userRepository.save(user);

        // Sync directly into Keycloak
        keycloakSyncService.syncUser(saved, password);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<User> toggleStatus(@PathVariable Long id) {
        return userRepository.findById(id).map(u -> {
            u.setStatus("ACTIF".equals(u.getStatus()) ? "SUSPENDU" : "ACTIF");
            return ResponseEntity.ok(userRepository.save(u));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus("ACTIF");
        long drivers = userRepository.countByRole("CONDUCTEUR");
        long passengers = userRepository.countByRole("PASSAGER");
        long admins = userRepository.countByRole("ADMIN");

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("drivers", drivers);
        stats.put("passengers", passengers);
        stats.put("admins", admins);

        return ResponseEntity.ok(stats);
    }
}
