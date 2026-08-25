package com.eventmanager.exception;

public class InsufficientCapacityException extends RuntimeException {

    public InsufficientCapacityException(String message) {
        super(message);
    }

    public InsufficientCapacityException(int available, int requested) {
        super(String.format("Insufficient capacity. Available: %d, Requested: %d", available, requested));
    }
}
