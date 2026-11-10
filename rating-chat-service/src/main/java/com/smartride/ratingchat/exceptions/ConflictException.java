package com.smartride.ratingchat.exceptions;

/** 409 - la ressource existe deja (ex : evaluation deja donnee pour cette reservation). */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
