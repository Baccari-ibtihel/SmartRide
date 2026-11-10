package com.smartride.ratingchat.exceptions;

/** 404 - la ressource demandee n'existe pas. */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
