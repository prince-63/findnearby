package com.findnearby.repository;

import com.findnearby.entity.Conversation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {

    Optional<Conversation> findByFinderIdAndBrokerId(String finderId, String brokerId);

    List<Conversation> findByFinderIdOrBrokerId(String finderId, String brokerId);
}
