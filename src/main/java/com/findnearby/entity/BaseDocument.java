package com.findnearby.entity;

import java.time.Instant;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Version;

@Getter
@Setter
public abstract class BaseDocument {

    @Id private String id;

    @CreatedDate private Instant createdAt;

    @LastModifiedDate private Instant updatedAt;

    @Version private Long version;
}
