package com.eventmanager.controller;

import com.eventmanager.dto.response.ApiResponse;
import com.eventmanager.dto.response.AnalyticsResponse;
import com.eventmanager.dto.response.UserResponse;
import com.eventmanager.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Admin-only endpoints for user management and analytics")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    @Operation(summary = "List all users (paginated)")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<UserResponse> users = adminService.listUsers(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get platform-wide analytics")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAnalytics() {
        AnalyticsResponse analytics = adminService.getAnalytics();
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    @PutMapping("/users/{userId}/role")
    @Operation(summary = "Change a user's role (ADMIN, ORGANIZER, ATTENDEE)")
    public ResponseEntity<ApiResponse<UserResponse>> changeUserRole(
            @PathVariable Long userId,
            @RequestParam String role,
            @AuthenticationPrincipal UserDetails adminEmail) {
        UserResponse user = adminService.changeUserRole(userId, role, adminEmail.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Role updated successfully", user));
    }

    @PutMapping("/users/{userId}/ban")
    @Operation(summary = "Ban or unban a user")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserBan(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails adminEmail) {
        UserResponse user = adminService.toggleUserBan(userId, adminEmail.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User ban status toggled", user));
    }
}
