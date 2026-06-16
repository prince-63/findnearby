package com.findnearby.entity;

import com.findnearby.dto.PostRequest;
import com.findnearby.enums.PostStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "posts")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Post extends BaseDocument {

    private String finderId;

    private String title;

    private String description;

    private String location;

    private Double budgetMin;
    private Double budgetMax;

    private Double latitude;

    private Double longitude;

    @Builder.Default private PostStatus status = PostStatus.OPEN;

    public static Post mapToPost(PostRequest request) {
        return Post.builder()
                .finderId(request.finderId())
                .title(request.title())
                .description(request.description())
                .location(request.location())
                .budgetMin(request.budgetMin())
                .budgetMax(request.budgetMax())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .status(PostStatus.OPEN)
                .build();
    }
}
