package com.smartcampus.connect.api;

import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

import java.util.concurrent.TimeUnit;

public class ApiClient {

    private static Retrofit retrofit = null;
    private static ApiService apiService = null;
    private static String activeBaseUrl = "";

    /**
     * Instantiates or switches Retrofit instance dynamically based on requested URL.
     * This supports testing both local networks, emulator gates, and production servers.
     */
    public static synchronized ApiService getClient(String baseUrl) {
        // Enforce trailing slash constraint
        if (!baseUrl.endsWith("/")) {
            baseUrl += "/";
        }

        if (retrofit == null || !activeBaseUrl.equals(baseUrl)) {
            activeBaseUrl = baseUrl;

            // Setup professional HTTP Logger of Request Payload Interoperability
            HttpLoggingInterceptor logger = new HttpLoggingInterceptor();
            logger.setLevel(HttpLoggingInterceptor.Level.BODY);

            OkHttpClient okHttpClient = new OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(15, TimeUnit.SECONDS)
                .writeTimeout(15, TimeUnit.SECONDS)
                .addInterceptor(logger)
                .build();

            retrofit = new Retrofit.Builder()
                .baseUrl(baseUrl)
                .client(okHttpClient)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

            apiService = retrofit.create(ApiService.class);
        }

        return apiService;
    }
}
