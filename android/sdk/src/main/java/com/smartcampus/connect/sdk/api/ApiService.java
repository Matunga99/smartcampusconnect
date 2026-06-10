package com.smartcampus.connect.sdk.api;

import com.smartcampus.connect.sdk.models.AuthModels;
import com.smartcampus.connect.sdk.models.ProfileModels;
import com.smartcampus.connect.sdk.models.SdkModels;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;

/**
 * Full SDK API service interface — mirrors every endpoint used by the Android app.
 */
public interface ApiService {

    // ── Auth ──────────────────────────────────────────────────────────────────
    @POST("api/auth/login")
    Call<AuthModels.LoginResponse> login(@Body AuthModels.LoginRequest request);

    @POST("api/auth/logout")
    Call<SdkModels.GenericResponse> logout(@Header("Authorization") String auth);

    @GET("api/auth/me")
    Call<AuthModels.MeResponse> getMe(@Header("Authorization") String auth);

    // ── Profile ───────────────────────────────────────────────────────────────
    @GET("api/profile/me")
    Call<ProfileModels.UserProfile> getProfile(@Header("Authorization") String auth);

    @PUT("api/profile/me")
    Call<ProfileModels.UpdateProfileResponse> updateProfile(
            @Header("Authorization") String auth,
            @Body ProfileModels.UpdateProfileRequest request);

    // ── Student ───────────────────────────────────────────────────────────────
    @GET("api/student/dashboard")
    Call<SdkModels.StudentDashboard> getStudentDashboard(@Header("Authorization") String auth);

    @GET("api/student/my-registrations")
    Call<List<SdkModels.CourseRegistration>> getMyRegistrations(@Header("Authorization") String auth);

    @GET("api/student/transcript")
    Call<List<SdkModels.ExamResult>> getTranscript(@Header("Authorization") String auth);

    // ── Lecturer ──────────────────────────────────────────────────────────────
    @GET("api/lecturer/my-units")
    Call<List<SdkModels.TeachingAssignment>> getMyUnits(@Header("Authorization") String auth);

    @POST("api/lecturer/log-attendance")
    Call<SdkModels.GenericResponse> logAttendance(
            @Header("Authorization") String auth,
            @Body SdkModels.LogAttendanceRequest request);

    @POST("api/lecturer/grade-student")
    Call<SdkModels.GenericResponse> gradeStudent(
            @Header("Authorization") String auth,
            @Body SdkModels.GradeStudentRequest request);

    // ── Admin ─────────────────────────────────────────────────────────────────
    @GET("api/admin/dashboard")
    Call<SdkModels.AdminDashboard> getAdminDashboard(@Header("Authorization") String auth);

    @GET("api/admin/students")
    Call<List<SdkModels.Student>> getStudents(@Header("Authorization") String auth);

    @GET("api/admin/staff")
    Call<List<SdkModels.Staff>> getStaff(@Header("Authorization") String auth);

    @GET("api/admin/academic-years")
    Call<List<SdkModels.AcademicYear>> getAcademicYears(@Header("Authorization") String auth);

    // ── Super Admin ───────────────────────────────────────────────────────────
    @GET("api/super/stats")
    Call<SdkModels.SuperStats> getSuperStats(@Header("Authorization") String auth);

    @GET("api/super/schools")
    Call<List<SdkModels.School>> getSchools(@Header("Authorization") String auth);

    @POST("api/super/schools/{id}/toggle")
    Call<SdkModels.GenericResponse> toggleSchool(
            @Header("Authorization") String auth,
            @Path("id") String schoolId);

    // ── Communications ────────────────────────────────────────────────────────
    @GET("api/communications/announcements")
    Call<List<SdkModels.Announcement>> getAnnouncements(@Header("Authorization") String auth);

    // ── Finance ───────────────────────────────────────────────────────────────
    @GET("api/finance/invoices")
    Call<List<SdkModels.Invoice>> getInvoices(@Header("Authorization") String auth);

    // ── Library ───────────────────────────────────────────────────────────────
    @GET("api/library/borrowings")
    Call<List<SdkModels.Borrowing>> getBorrowings(@Header("Authorization") String auth);
}
