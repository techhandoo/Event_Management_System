package com.eventmanager.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangeEmailRequest {

    @NotBlank(message = "New email is required")
    @Email(message = "Please provide a valid email address")
    private String newEmail;

    @NotBlank(message = "Password is required to change email")
    private String password;
}
