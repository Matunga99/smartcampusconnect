package com.smartcampus.connect.api;

import com.smartcampus.connect.models.AuthModels;
import com.smartcampus.connect.models.ProfileModels;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.PUT;

public interface ApiService {

    // Authenticate through the centralized server
    @POST("api/auth/login")
    Call<AuthModels.LoginResponse> login(
        @Body AuthModels.LoginRequest request
    );

    // Fetch Authorized session user profile context
    @GET("api/profile/me")
    Call<ProfileModels.UserProfile> getProfile(
        @Header("Authorization") String authHeader
    );

    // Perform profile mutation save operation
    @PUT("api/profile/me")
    Call<ProfileModels.UpdateProfileResponse> updateProfile(
        @Header("Authorization") String authHeader,
        @Body ProfileModels.UpdateProfileRequest request
    );
}
