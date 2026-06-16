package com.findnearby.repository;

import com.findnearby.entity.Post;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {

    List<Post> findByFinderIdOrderByCreatedAtDesc(String finderId);

    List<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
