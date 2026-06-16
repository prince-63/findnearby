package com.findnearby.entity;

import com.findnearby.enums.ProfileType;
import com.findnearby.enums.UserStatus;
import lombok.*;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile extends BaseDocument {

    private String name;

    @Indexed(unique = true)
    private String email;

    @Indexed(unique = true)
    private String mobileNo;

    private String password;

    private ProfileType profileType;

    private String profileImageKey;

    private UserStatus status;

    private Double latitude;

    private Double longitude;
}
