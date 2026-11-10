package com.smartride.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Global Gateway Filter that extracts authenticated identity from Keycloak JWT
 * and propagates it as secure headers to downstream microservices:
 * - X-User-Id : Keycloak UUID (sub)
 * - X-User-Email : email address
 * - X-User-Preferred-Username : username
 * - X-User-Roles : comma-separated list of roles (e.g. ROLE_ADMIN,ROLE_CONDUCTEUR)
 * - Authorization : Bearer token is preserved
 */
@Component
public class KeycloakTokenRelayGlobalFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .filter(Authentication::isAuthenticated)
                .map(Authentication::getPrincipal)
                .filter(principal -> principal instanceof Jwt)
                .cast(Jwt.class)
                .map(jwt -> {
                    String userId = jwt.getSubject();
                    String email = jwt.getClaimAsString("email");
                    String username = jwt.getClaimAsString("preferred_username");

                    // Extract roles from realm_access
                    String rolesStr = "";
                    Map<String, Object> realmAccess = jwt.getClaim("realm_access");
                    if (realmAccess != null && realmAccess.containsKey("roles")) {
                        Object rolesObj = realmAccess.get("roles");
                        if (rolesObj instanceof Collection<?> roles) {
                            rolesStr = roles.stream()
                                    .map(Object::toString)
                                    .collect(Collectors.joining(","));
                        }
                    }

                    ServerHttpRequest.Builder requestBuilder = exchange.getRequest().mutate()
                            .header("X-User-Id", userId != null ? userId : "")
                            .header("X-User-Email", email != null ? email : "")
                            .header("X-User-Username", username != null ? username : "")
                            .header("X-User-Roles", rolesStr);

                    return exchange.mutate().request(requestBuilder.build()).build();
                })
                .defaultIfEmpty(exchange)
                .flatMap(chain::filter);
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }
}
