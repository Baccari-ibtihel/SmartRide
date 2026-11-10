package com.smartride.ratingchat.exceptions;

/** 403 - l'utilisateur n'a pas le droit d'agir sur cette ressource. */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
