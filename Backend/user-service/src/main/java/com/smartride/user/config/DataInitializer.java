package com.smartride.user.config;

import com.smartride.user.model.User;
import com.smartride.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDatabase(UserRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                List<User> initialUsers = List.of(
                        new User("admin", "admin@smartride.tn", "Admin", "SmartRide", "+216 71 000 000", "ADMIN", "ACTIF"),
                        new User("sami_mansouri", "sami.mansouri@gmail.com", "Sami", "Mansouri", "+216 98 450 120", "CONDUCTEUR", "ACTIF"),
                        new User("amira_bensalah", "amira.bensalah@topnet.tn", "Amira", "Ben Salah", "+216 22 345 678", "CONDUCTEUR", "ACTIF"),
                        new User("youssef_trabelsi", "youssef.tr@gmail.com", "Youssef", "Trabelsi", "+216 50 112 334", "CONDUCTEUR", "ACTIF"),
                        new User("ibtihel_baccari", "ibtihel.baccari@smartride.tn", "Ibtihel", "Baccari", "+216 55 123 456", "ADMIN", "ACTIF"),
                        new User("karim_gharbi", "karim.gharbi@yahoo.fr", "Karim", "Gharbi", "+216 93 887 766", "CONDUCTEUR", "SUSPENDU"),
                        new User("fatma_khelifi", "fatma.kh@gmail.com", "Fatma", "Khelifi", "+216 27 654 321", "PASSAGER", "ACTIF"),
                        new User("leila_bouazizi", "leila.bouazizi@gmail.com", "Leila", "Bouazizi", "+216 52 900 111", "PASSAGER", "ACTIF")
                );
                initialUsers.forEach(u -> u.setTripsCount((int) (Math.random() * 50)));
                repository.saveAll(initialUsers);
                System.out.println("Default demo users initialized in smartride_users MySQL database!");
            }
        };
    }
}
