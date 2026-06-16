package com.findnearby.service;

import static com.findnearby.entity.Post.mapToPost;
import static com.findnearby.service.UserProfileService.haversineDistance;

import com.findnearby.dto.PostRequest;
import com.findnearby.dto.PostResponse;
import com.findnearby.entity.Post;
import com.findnearby.enums.PostStatus;
import com.findnearby.repository.PostRepository;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserProfileService userProfileService;

    public PostResponse createPost(PostRequest request) {
        var post = postRepository.save(mapToPost(request));
        return mapToResponse(post);
    }

    public List<PostResponse> getAllPosts(
            int page, int size, Double lat, Double lng, Double radiusKm) {
        var posts = postRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
        var result = posts.stream().map(this::mapToResponse).collect(Collectors.toList());

        if (lat != null && lng != null && radiusKm != null) {
            result =
                    result.stream()
                            .filter(
                                    p ->
                                            p.latitude() != null
                                                    && p.longitude() != null
                                                    && haversineDistance(
                                                                    lat,
                                                                    lng,
                                                                    p.latitude(),
                                                                    p.longitude())
                                                            <= radiusKm)
                            .sorted(
                                    Comparator.comparingDouble(
                                            p ->
                                                    haversineDistance(
                                                            lat, lng, p.latitude(), p.longitude())))
                            .collect(Collectors.toList());
        }

        return result;
    }

    public PostResponse getPost(String id) {
        var post = postRepository.findById(id).orElseThrow();
        return mapToResponse(post);
    }

    public void closePost(String id, String finderId) {
        var post = postRepository.findById(id).orElseThrow();
        if (!post.getFinderId().equals(finderId)) {
            throw new RuntimeException("Unauthorized");
        }
        post.setStatus(PostStatus.CLOSED);
        postRepository.save(post);
    }

    private PostResponse mapToResponse(Post post) {
        var finder = userProfileService.getUser(post.getFinderId());
        return new PostResponse(
                post.getId(),
                post.getFinderId(),
                finder.name(),
                finder.profileImageKey(),
                post.getTitle(),
                post.getDescription(),
                post.getLocation(),
                post.getBudgetMin(),
                post.getBudgetMax(),
                post.getLatitude(),
                post.getLongitude(),
                post.getStatus(),
                post.getCreatedAt());
    }
}
