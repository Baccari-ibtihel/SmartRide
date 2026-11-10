package com.smartride.ratingchat.config;


import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Swagger UI : http://localhost:8085/swagger-ui.html */
@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI ratingChatOpenApi() {
        return new OpenAPI().info(new Info()
                .title("SmartRide - Rating & Chat Service")
                .version("1.0.0")
                .description("""
                        Evaluations passager/conducteur et messagerie temps reel.
                        L'utilisateur connecte est transmis dans l'en-tete X-User-Id.
                        WebSocket STOMP : /ws/chat (voir README)."""));
    }
}
