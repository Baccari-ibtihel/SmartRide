package com.smartride.dashboard.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

/**
 * Configuration CORS — autorise Swagger UI et les clients web
 * à appeler le Dashboard Service sans erreur "Failed to fetch".
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // Autoriser toutes les origines (dev local)
        config.setAllowedOriginPatterns(List.of("*"));

        // Méthodes HTTP autorisées
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // En-têtes autorisés
        config.setAllowedHeaders(List.of("*"));

        // Autoriser les credentials (cookies, auth headers)
        config.setAllowCredentials(true);

        // Appliquer à toutes les routes
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
