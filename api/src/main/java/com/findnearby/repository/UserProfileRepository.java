package com.findnearby.repository;

import com.findnearby.entity.UserProfile;
import com.findnearby.enums.ProfileType;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserProfileRepository extends MongoRepository<UserProfile, String> {

    Optional<UserProfile> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByMobileNo(String mobileNo);

    Page<UserProfile> findByProfileType(ProfileType profileType, Pageable pageable);

    Page<UserProfile> findAll(Pageable pageable);
}
