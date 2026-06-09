package com.smartcampus.connect.sdk.models;

import com.google.gson.annotations.SerializedName;

public class AuthModels {

    // Request payload for authentication
    public static class LoginRequest {
        public String email;
        public String password;

        public LoginRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }
    }

    // Response structure for authentication
    public static class LoginResponse {
        public String token;
        public User user;
    }

    // Sub-structure representing safe authorized user profile
    public static class User {
        public String id;
        public String name;
        public String email;
        public String role;
        
        @SerializedName("schoolId")
        public String schoolId;
    }
}
