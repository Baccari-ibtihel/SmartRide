package com.smartride.dashboard.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI dashboardOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SmartRide - Dashboard Service API")
                        .description("Microservice backend de gestion des statistiques, suivi des trajets, utilisateurs, réservations et paiements.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Ibtihel Baccari")
                                .email("ibtihel.baccari@esprit.tn"))
                        .license(new License().name("Apache 2.0").url("https://springdoc.org")));
    }
}
