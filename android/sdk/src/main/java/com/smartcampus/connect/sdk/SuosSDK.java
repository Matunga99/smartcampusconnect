package com.smartcampus.connect.sdk;

import com.smartcampus.connect.sdk.api.ApiService;
import com.smartcampus.connect.sdk.models.AuthModels;
import com.smartcampus.connect.sdk.models.ProfileModels;
import com.smartcampus.connect.sdk.models.SdkModels;

import java.util.List;

import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Callback;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

import java.util.concurrent.TimeUnit;

/**
 * SuosSDK — the SmartCampusConnect X Android SDK.
 *
 * Provides a clean, role-aware interface to every backend endpoint.
 * Usage:
 *   SuosSDK.initialize("https://your-server.com");
 *   SuosSDK.getInstance().login(email, password, callback);
 */
public class SuosSDK {

    private static SuosSDK instance;
    private final ApiService apiService;
    private String authToken;

    private SuosSDK(String baseUrl) {
        if (!baseUrl.endsWith("/")) baseUrl += "/";

        HttpLoggingInterceptor logger = new HttpLoggingInterceptor();
        logger.setLevel(HttpLoggingInterceptor.Level.BODY);

        OkHttpClient client = new OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(15, TimeUnit.SECONDS)
                .writeTimeout(15, TimeUnit.SECONDS)
                .addInterceptor(logger)
                .build();

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(baseUrl)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        this.apiService = retrofit.create(ApiService.class);
    }

    /** Initialise the global SDK instance. Must be called before getInstance(). */
    public static synchronized void initialize(String baseUrl) {
        instance = new SuosSDK(baseUrl);
    }

    /** Returns the singleton SDK instance. Throws if not initialised. */
    public static synchronized SuosSDK getInstance() {
        if (instance == null)
            throw new IllegalStateException("Call SuosSDK.initialize(baseUrl) first.");
        return instance;
    }

    /** Access low-level Retrofit service for advanced usage. */
    public ApiService getApiService() { return apiService; }

    // ── Token management ──────────────────────────────────────────────────────
    public void setAuthToken(String token) { this.authToken = token; }
    public String getAuthToken() { return authToken; }
    private String bearer() { return "Bearer " + (authToken != null ? authToken : ""); }

    // ── Auth ──────────────────────────────────────────────────────────────────
    public void login(String email, String password, Callback<AuthModels.LoginResponse> cb) {
        apiService.login(new AuthModels.LoginRequest(email, password)).enqueue(cb);
    }

    public void logout(Callback<SdkModels.GenericResponse> cb) {
        apiService.logout(bearer()).enqueue(cb);
    }

    public void getMe(Callback<AuthModels.MeResponse> cb) {
        apiService.getMe(bearer()).enqueue(cb);
    }

    // ── Profile ───────────────────────────────────────────────────────────────
    public void getProfile(Callback<ProfileModels.UserProfile> cb) {
        apiService.getProfile(bearer()).enqueue(cb);
    }

    public void updateProfile(String email, ProfileModels.ProfileDetails details,
                              Callback<ProfileModels.UpdateProfileResponse> cb) {
        apiService.updateProfile(bearer(),
                new ProfileModels.UpdateProfileRequest(email, details)).enqueue(cb);
    }

    // ── Student ───────────────────────────────────────────────────────────────
    public void getStudentDashboard(Callback<SdkModels.StudentDashboard> cb) {
        apiService.getStudentDashboard(bearer()).enqueue(cb);
    }

    public void getMyRegistrations(Callback<List<SdkModels.CourseRegistration>> cb) {
        apiService.getMyRegistrations(bearer()).enqueue(cb);
    }

    public void getTranscript(Callback<List<SdkModels.ExamResult>> cb) {
        apiService.getTranscript(bearer()).enqueue(cb);
    }

    // ── Lecturer ──────────────────────────────────────────────────────────────
    public void getMyUnits(Callback<List<SdkModels.TeachingAssignment>> cb) {
        apiService.getMyUnits(bearer()).enqueue(cb);
    }

    public void logAttendance(String unitId, String date, String status,
                              Callback<SdkModels.GenericResponse> cb) {
        apiService.logAttendance(bearer(),
                new SdkModels.LogAttendanceRequest(unitId, date, status)).enqueue(cb);
    }

    public void gradeStudent(String studentId, String unitId, String grade,
                             String semesterId, Callback<SdkModels.GenericResponse> cb) {
        apiService.gradeStudent(bearer(),
                new SdkModels.GradeStudentRequest(studentId, unitId, grade, semesterId)).enqueue(cb);
    }

    // ── Admin ─────────────────────────────────────────────────────────────────
    public void getAdminDashboard(Callback<SdkModels.AdminDashboard> cb) {
        apiService.getAdminDashboard(bearer()).enqueue(cb);
    }

    public void getStudents(Callback<List<SdkModels.Student>> cb) {
        apiService.getStudents(bearer()).enqueue(cb);
    }

    public void getStaff(Callback<List<SdkModels.Staff>> cb) {
        apiService.getStaff(bearer()).enqueue(cb);
    }

    public void getAcademicYears(Callback<List<SdkModels.AcademicYear>> cb) {
        apiService.getAcademicYears(bearer()).enqueue(cb);
    }

    // ── Super Admin ───────────────────────────────────────────────────────────
    public void getSuperStats(Callback<SdkModels.SuperStats> cb) {
        apiService.getSuperStats(bearer()).enqueue(cb);
    }

    public void getSchools(Callback<List<SdkModels.School>> cb) {
        apiService.getSchools(bearer()).enqueue(cb);
    }

    public void toggleSchool(String schoolId, Callback<SdkModels.GenericResponse> cb) {
        apiService.toggleSchool(bearer(), schoolId).enqueue(cb);
    }

    // ── Communications ────────────────────────────────────────────────────────
    public void getAnnouncements(Callback<List<SdkModels.Announcement>> cb) {
        apiService.getAnnouncements(bearer()).enqueue(cb);
    }

    // ── Finance ───────────────────────────────────────────────────────────────
    public void getInvoices(Callback<List<SdkModels.Invoice>> cb) {
        apiService.getInvoices(bearer()).enqueue(cb);
    }

    // ── Library ───────────────────────────────────────────────────────────────
    public void getBorrowings(Callback<List<SdkModels.Borrowing>> cb) {
        apiService.getBorrowings(bearer()).enqueue(cb);
    }
}
