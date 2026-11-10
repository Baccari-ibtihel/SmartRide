package com.smartride.ratingchat.utils;

/**
 * Identite de l'utilisateur connecte.
 * Pour l'instant le client envoie l'en-tete X-User-Id ; une fois le JWT en place,
 * c'est l'API Gateway qui le renseignera a partir du token.
 */
public final class UserHeaders {

    public static final String USER_ID = "X-User-Id";

    private UserHeaders() {
    }
}
