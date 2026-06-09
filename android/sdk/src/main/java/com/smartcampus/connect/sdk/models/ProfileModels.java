package com.smartcampus.connect.sdk.models;

import com.google.gson.annotations.SerializedName;

public class ProfileModels {

    // Main user structure returned from /api/profile/me (includes profile metadata)
    public static class UserProfile {
        public String id;
        public String name;
        public String email;
        public String role;
        public String schoolId;

        @SerializedName("profile")
        public ProfileDetails profile;
    }

    // Detailed metadata properties for nested profile tracking
    public static class ProfileDetails {
        @SerializedName("avatarUrl")
        public String avatarUrl;

        @SerializedName("coverUrl")
        public String coverUrl;

        @SerializedName("bio")
        public String bio;

        @SerializedName("phone")
        public String phone;

        @SerializedName("dob")
        public String dob;

        @SerializedName("gender")
        public String gender;

        @SerializedName("address")
        public String address;
    }

    // Direct Request payload matching PUT /api/profile/me API design
    public static class UpdateProfileRequest {
        @SerializedName("email")
        public String email;

        @SerializedName("profile")
        public ProfileDetails profile;

        public UpdateProfileRequest(String email, ProfileDetails profile) {
            this.email = email;
            this.profile = profile;
        }
    }

    // Response response code
    public static class UpdateProfileResponse {
        public String message;
        public UserProfile user;
    }
}
