package com.smartcampus.connect.models;

import com.google.gson.annotations.SerializedName;

public class AuthModels {

    // Login request payload
    public static class LoginRequest {
        public String email;
        public String password;

        public LoginRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }
    }

    // Login response
    public static class LoginResponse {
        public String token;
        public User user;
    }

    // Authenticated user object
    public static class User {
        public String id;
        public String name;
        public String email;
        public String role;
        public String phone;

        @SerializedName("schoolId")
        public String schoolId;

        @SerializedName("regNumber")
        public String regNumber;
    }

    // /api/auth/me response
    public static class MeResponse {
        public User user;
    }
}
