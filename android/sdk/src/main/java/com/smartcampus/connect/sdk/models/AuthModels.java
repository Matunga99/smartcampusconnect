package com.smartcampus.connect.sdk.models;

import com.google.gson.annotations.SerializedName;

public class AuthModels {

    public static class LoginRequest {
        public String email;
        public String password;

        public LoginRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }
    }

    public static class LoginResponse {
        public String token;
        public User user;
    }

    public static class MeResponse {
        public User user;
    }

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
}
