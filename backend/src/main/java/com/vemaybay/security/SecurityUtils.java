package com.vemaybay.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static UserPrincipal getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
            return (UserPrincipal) auth.getPrincipal();
        }
        return null;
    }

    public static Integer getCurrentUserId() {
        UserPrincipal principal = getCurrentUser();
        return principal != null ? principal.getUserId() : null;
    }

    public static String getCurrentRole() {
        UserPrincipal principal = getCurrentUser();
        return principal != null ? principal.getRole() : null;
    }

    public static boolean hasRole(String role) {
        String currentRole = getCurrentRole();
        return currentRole != null && currentRole.equals(role);
    }

    public static boolean isAdmin() {
        return hasRole("Admin");
    }

    public static boolean isStaff() {
        return hasRole("NhanVien");
    }

    public static boolean isAgent() {
        return hasRole("DaiLy");
    }

    public static boolean isUser() {
        return hasRole("KhachHang");
    }
}
