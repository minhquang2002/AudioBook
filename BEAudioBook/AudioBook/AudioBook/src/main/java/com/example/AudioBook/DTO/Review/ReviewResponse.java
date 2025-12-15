package com.example.AudioBook.DTO.Review;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ReviewResponse {
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("review")
    private String review;
    
    @JsonProperty("rating")
    private Integer rating;
    
    @JsonProperty("date")
    private String date;
    
    @JsonProperty("user")
    private UserInfo user;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserInfo {
        @JsonProperty("username")
        private String username;
    }
}
