package com.findnearby.config;

import org.springframework.context.ApplicationEvent;

public class UserConnectedEvent extends ApplicationEvent {

    private final String userId;

    public UserConnectedEvent(Object source, String userId) {
        super(source);
        this.userId = userId;
    }

    public String getUserId() {
        return userId;
    }
}
