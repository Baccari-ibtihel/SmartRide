package com.smartride.dashboard.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI dashboardOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("📊 Dashboard Service — SmartRide")
                        .description("""
                                ## Tableau de bord administrateur
                                
                                Ce service centralise les **statistiques de la plateforme SmartRide** en agrégeant les données de tous les microservices connectés.
                                
                                ### Services connectés
                                | Service | Données collectées |
                                |---------|-------------------|
                                | 👥 User Service | Nombre d'utilisateurs, nouveaux inscrits |
                                | 🚗 Trip Service | Trajets publiés, actifs, terminés |
                                | 📅 Booking Service | Réservations par statut |
                                | 💳 Payment Service | Revenus, transactions |
                                | 📍 Notification/Tracking | Événements de suivi |
                                
                                ### Base de données
                                Les snapshots de métriques sont persistés dans **MySQL** (`smartride_dashboard`).
                                """)
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("Ibtihel Baccari")
                                .email("ibtihel.baccari@smartride.com"))
                        .license(new License()
                                .name("SmartRide ©2026")
                                .url("http://localhost:8761")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8088")
                                .description("🖥️ Serveur local — Dashboard Service"),
                        new Server()
                                .url("http://localhost:8080")
                                .description("🌐 Via API Gateway")
                ));
    }
}
