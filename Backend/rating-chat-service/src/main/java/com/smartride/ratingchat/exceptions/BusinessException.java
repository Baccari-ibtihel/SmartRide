package com.smartride.ratingchat.exceptions;

/** 400 - la requete est bien formee mais viole une regle metier. */
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}
