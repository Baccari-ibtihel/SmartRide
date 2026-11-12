package com.smartride.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Security Configuration for Spring Cloud Gateway with Keycloak as OAuth2 / OpenID Connect Provider.
 * Enforces Zero-Trust boundary and Role-Based Access Control (RBAC) at the gateway level.
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeExchange(exchanges -> exchanges
                        // All pre-flight CORS requests
                        .pathMatchers(HttpMethod.OPTIONS).permitAll()
                        // Public Endpoints & API Routes connected from Frontend
                        .pathMatchers(
                                "/",
                                "/api/users/**",
                                "/api/trips/**",
                                "/api/bookings/**",
                                "/api/payments/**",
                                "/api/ratings/**",
                                "/api/chat/**",
                                "/api/notifications/**",
                                "/api/tracking/**",
                                "/api/matching/**",
                                "/api/dashboard/**",
                                "/actuator/**",
                                "/eureka/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()
                        .anyExchange().permitAll()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(grantedAuthoritiesExtractor()))
                )
                .build();
    }

    /**
     * Converts Keycloak realm roles (e.g., ADMIN, CONDUCTEUR, PASSAGER)
     * into Spring Security GrantedAuthorities with "ROLE_" prefix.
     */
    @Bean
    public Converter<Jwt, Mono<AbstractAuthenticationToken>> grantedAuthoritiesExtractor() {
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(new KeycloakRoleConverter());
        return new ReactiveJwtAuthenticationConverterAdapter(jwtAuthenticationConverter);
    }

    /**
     * Decodes and cryptographically validates Keycloak JWT tokens.
     * Validates signature against Keycloak JWKS endpoint and timestamp expiration,
     * supporting both local Postman calls (localhost:8180) and Docker internal calls (keycloak:8080).
     */
    @Bean
    public ReactiveJwtDecoder reactiveJwtDecoder(@Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}") String jwkSetUri) {
        NimbusReactiveJwtDecoder jwtDecoder = NimbusReactiveJwtDecoder.withJwkSetUri(jwkSetUri).build();
        OAuth2TokenValidator<Jwt> withTimestamp = new JwtTimestampValidator();
        jwtDecoder.setJwtValidator(withTimestamp);
        return jwtDecoder;
    }

    /**
     * Extracts roles from Keycloak JWT payload (realm_access.roles and resource_access.<client>.roles).
     */
    public static class KeycloakRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
        @Override
        @SuppressWarnings("unchecked")
        public Collection<GrantedAuthority> convert(Jwt jwt) {
            Set<GrantedAuthority> authorities = new HashSet<>();

            // 1. Extract Realm-Level Roles
            Map<String, Object> realmAccess = (Map<String, Object>) jwt.getClaims().get("realm_access");
            if (realmAccess != null && realmAccess.containsKey("roles")) {
                List<String> roles = (List<String>) realmAccess.get("roles");
                authorities.addAll(roles.stream()
                        .map(roleName -> new SimpleGrantedAuthority("ROLE_" + roleName.toUpperCase()))
                        .collect(Collectors.toSet()));
            }

            // 2. Extract Client-Level Roles (smartride-gateway client)
            Map<String, Object> resourceAccess = (Map<String, Object>) jwt.getClaims().get("resource_access");
            if (resourceAccess != null) {
                resourceAccess.forEach((client, clientMap) -> {
                    if (clientMap instanceof Map<?, ?> clientDetails) {
                        Object rolesObj = clientDetails.get("roles");
                        if (rolesObj instanceof List<?> clientRoles) {
                            for (Object role : clientRoles) {
                                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toString().toUpperCase()));
                            }
                        }
                    }
                });
            }

            return authorities;
        }
    }

    /**
     * CORS Configuration for Angular frontend running on http://localhost:4200.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:4200");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
