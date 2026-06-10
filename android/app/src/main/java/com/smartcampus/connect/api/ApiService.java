package com.smartcampus.connect.api;

import com.smartcampus.connect.models.AuthModels;
import com.smartcampus.connect.models.DashboardModels;
import com.smartcampus.connect.models.ProfileModels;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;

/**
 * Full Retrofit API interface matching every SmartCampusConnect X backend endpoint
 * used by the Android app across all roles: superadmin, admin, lecturer, student.
 */
public interface ApiService {

    // ── Auth ─────────────────────────────────────────────────────────────────

    @POST("api/auth/login")
    Call<AuthModels.LoginResponse> login(@Body AuthModels.LoginRequest request);

    @POST("api/auth/logout")
    Call<DashboardModels.GenericResponse> logout(@Header("Authorization") String auth);

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
    Call<DashboardModels.StudentDashboard> getStudentDashboard(@Header("Authorization") String auth);

    @GET("api/student/my-registrations")
    Call<List<DashboardModels.CourseRegistration>> getMyRegistrations(@Header("Authorization") String auth);

    @GET("api/student/transcript")
    Call<List<DashboardModels.ExamResult>> getTranscript(@Header("Authorization") String auth);

    @GET("api/admin/timetables")
    Call<List<DashboardModels.TimetableEntry>> getTimetables(@Header("Authorization") String auth);

    // ── Student Finance ───────────────────────────────────────────────────────

    @GET("api/finance/invoices")
    Call<List<DashboardModels.Invoice>> getInvoices(@Header("Authorization") String auth);

    @GET("api/finance/student-balances")
    Call<List<DashboardModels.StudentBalance>> getStudentBalances(@Header("Authorization") String auth);

    // ── Student Library ───────────────────────────────────────────────────────

    @GET("api/library/books")
    Call<List<DashboardModels.Book>> getBooks(@Header("Authorization") String auth);

    @GET("api/library/borrowings")
    Call<List<DashboardModels.Borrowing>> getBorrowings(@Header("Authorization") String auth);

    @GET("api/library/fines")
    Call<List<DashboardModels.LibraryFine>> getLibraryFines(@Header("Authorization") String auth);

    // ── Announcements ─────────────────────────────────────────────────────────

    @GET("api/communications/announcements")
    Call<List<DashboardModels.Announcement>> getAnnouncements(@Header("Authorization") String auth);

    @POST("api/communications/announcements")
    Call<DashboardModels.Announcement> sendAnnouncement(
            @Header("Authorization") String auth,
            @Body DashboardModels.SendAnnouncementRequest request);

    // ── Lecturer ──────────────────────────────────────────────────────────────

    @GET("api/lecturer/dashboard")
    Call<DashboardModels.LecturerDashboard> getLecturerDashboard(@Header("Authorization") String auth);

    @GET("api/lecturer/my-units")
    Call<List<DashboardModels.TeachingAssignment>> getMyUnits(@Header("Authorization") String auth);

    @POST("api/lecturer/log-attendance")
    Call<DashboardModels.GenericResponse> logAttendance(
            @Header("Authorization") String auth,
            @Body DashboardModels.LogAttendanceRequest request);

    @POST("api/lecturer/grade-student")
    Call<DashboardModels.GenericResponse> gradeStudent(
            @Header("Authorization") String auth,
            @Body DashboardModels.GradeStudentRequest request);

    // ── Admin ─────────────────────────────────────────────────────────────────

    @GET("api/admin/dashboard")
    Call<DashboardModels.AdminDashboard> getAdminDashboard(@Header("Authorization") String auth);

    @GET("api/admin/students")
    Call<List<DashboardModels.Student>> getStudents(@Header("Authorization") String auth);

    @GET("api/admin/staff")
    Call<List<DashboardModels.Staff>> getStaff(@Header("Authorization") String auth);

    @GET("api/admin/departments")
    Call<List<DashboardModels.Department>> getDepartments(@Header("Authorization") String auth);

    @GET("api/admin/programs")
    Call<List<DashboardModels.Program>> getPrograms(@Header("Authorization") String auth);

    @GET("api/admin/units")
    Call<List<DashboardModels.Unit>> getUnits(@Header("Authorization") String auth);

    @GET("api/admin/academic-years")
    Call<List<DashboardModels.AcademicYear>> getAcademicYears(@Header("Authorization") String auth);

    @GET("api/admin/semesters")
    Call<List<DashboardModels.Semester>> getSemesters(@Header("Authorization") String auth);

    @DELETE("api/admin/students/{id}")
    Call<DashboardModels.GenericResponse> deleteStudent(
            @Header("Authorization") String auth,
            @Path("id") String studentId);

    @DELETE("api/admin/staff/{id}")
    Call<DashboardModels.GenericResponse> deleteStaff(
            @Header("Authorization") String auth,
            @Path("id") String staffId);

    // ── Super Admin ───────────────────────────────────────────────────────────

    @GET("api/super/stats")
    Call<DashboardModels.SuperStats> getSuperStats(@Header("Authorization") String auth);

    @GET("api/super/schools")
    Call<List<DashboardModels.School>> getSchools(@Header("Authorization") String auth);

    @POST("api/super/schools/{id}/toggle")
    Call<DashboardModels.GenericResponse> toggleSchool(
            @Header("Authorization") String auth,
            @Path("id") String schoolId);
}
