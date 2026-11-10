package com.smartride.ratingchat.websocket;


import java.security.Principal;

/** Utilisateur associe a une session WebSocket (son nom = son id). */
public record StompPrincipal(String userId) implements Principal {

    @Override
    public String getName() {
        return userId;
    }
}
