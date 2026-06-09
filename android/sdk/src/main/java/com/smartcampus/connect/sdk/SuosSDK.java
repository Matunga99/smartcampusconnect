package com.smartcampus.connect.sdk;

import com.smartcampus.connect.sdk.api.ApiService;
import com.smartcampus.connect.sdk.models.AuthModels;
import com.smartcampus.connect.sdk.models.ProfileModels;

import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

import java.util.concurrent.TimeUnit;

public class SuosSDK {

    private static SuosSDK instance;
    private final ApiService apiService;
    private final String baseUrl;

    private SuosSDK(String baseUrl) {
        if (!baseUrl.endsWith("/")) {
            baseUrl += "/";
        }
        this.baseUrl = baseUrl;

        // Custom logging interceptor for network observability
        HttpLoggingInterceptor logger = new HttpLoggingInterceptor();
        logger.setLevel(HttpLoggingInterceptor.Level.BODY);

        OkHttpClient okHttpClient = new OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .writeTimeout(15, TimeUnit.SECONDS)
            .addInterceptor(logger)
            .build();

        Retrofit retrofit = new Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build();

        this.apiService = retrofit.create(ApiService.class);
    }

    /**
     * Initializes the global SUOS Client SDK instance.
     * @param baseUrl The base URL of the active SmartCampus / SUOS server (e.g. "https://suos.dev").
     */
    public static synchronized void initialize(String baseUrl) {
        instance = new SuosSDK(baseUrl);
    }

    /**
     * Retrieves the instantiated global SUOS SDK instance.
     * Throws an exception if compile initialization was not yet invoked.
     */
    public static synchronized SuosSDK getInstance() {
        if (instance == null) {
            throw new IllegalStateException("SUOS Client SDK is not initialized. Please call SuosSDK.initialize(baseUrl) first.");
        }
        return instance;
    }

    /**
     * Access the low-level Retrofit API Service implementation.
     */
    public ApiService getApiService() {
        return this.apiService;
    }

    /**
     * Facilitates user authorization against the SUOS cluster.
     */
    public void login(String email, String password, Callback<AuthModels.LoginResponse> callback) {
        AuthModels.LoginRequest request = new AuthModels.LoginRequest(email, password);
        apiService.login(request).enqueue(callback);
    }

    /**
     * Fetches details for the currently authenticated session owner.
     */
    public void getProfile(String authToken, Callback<ProfileModels.UserProfile> callback) {
        String authHeader = "Bearer " + authToken;
        apiService.getProfile(authHeader).enqueue(callback);
    }

    /**
     * Saves user modifications to the profile resource collection.
     */
    public void updateProfile(String authToken, String email, ProfileModels.ProfileDetails profileDetails, Callback<ProfileModels.UpdateProfileResponse> callback) {
        String authHeader = "Bearer " + authToken;
        ProfileModels.UpdateProfileRequest request = new ProfileModels.UpdateProfileRequest(email, profileDetails);
        apiService.updateProfile(authHeader, request).enqueue(callback);
    }
}
