package com.example.AudioBook.DTO.User;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ChangePasswordRequest {
    @JsonProperty("oldPassword")
    private String oldPassword;
    @JsonProperty("newPassword")
    private String newPassword;
}
