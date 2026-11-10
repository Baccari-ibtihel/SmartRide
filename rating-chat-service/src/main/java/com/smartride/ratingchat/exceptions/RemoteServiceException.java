package com.smartride.ratingchat.exceptions;

/** 503 - un autre microservice (trouve via Eureka) est injoignable. */
public class RemoteServiceException extends RuntimeException {

    public RemoteServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
