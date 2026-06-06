package com.findnearby.repository;

import com.findnearby.entity.UserProfile;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserProfileRepository extends MongoRepository<UserProfile, String> {

    Optional<UserProfile> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByMobileNo(String mobileNo);
}
