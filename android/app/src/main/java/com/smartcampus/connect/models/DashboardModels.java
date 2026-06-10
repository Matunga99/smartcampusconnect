package com.smartcampus.connect.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

/**
 * All response models for dashboard data across all roles.
 */
public class DashboardModels {

    // ── Shared ──────────────────────────────────────────────────────────────

    public static class School {
        public String id;
        public String name;
        public String code;
        public String email;
        public String phone;
        public String institutionType;
        public boolean disabled;
    }

    public static class Department {
        public String id;
        public String schoolId;
        public String name;
    }

    public static class Program {
        public String id;
        public String schoolId;
        public String departmentId;
        public String name;
        public String code;
        public Integer capacity;
        public String departmentName;
    }

    public static class Unit {
        public String id;
        public String schoolId;
        public String programId;
        public String code;
        public String name;
        public String programName;
    }

    public static class Staff {
        public String id;
        public String schoolId;
        public String userId;
        public String name;
        public String email;
        public String phone;
        public String role;
        public String departmentName;
    }

    public static class Student {
        public String id;
        public String schoolId;
        public String name;
        public String email;
        public String phone;
        public String regNumber;
        public String programId;
        public String programName;
        public String departmentName;
        public String status;
        public String currentLevel;
        public String currentSemester;
        public int yearOfStudy;
    }

    public static class AcademicYear {
        public String id;
        public String name;
        public String startDate;
        public String endDate;
        public String status;
    }

    public static class Semester {
        public String id;
        public String name;
        public String startDate;
        public String endDate;
        public String status;
        public String academicYearName;
    }

    public static class Announcement {
        public String id;
        public String title;
        public String message;
        public String priority;
        public String senderName;
        public String createdAt;
    }

    // ── Student dashboard ────────────────────────────────────────────────────

    public static class StudentDashboard {
        public Student student;
        public List<CourseRegistration> registrations;
        public List<TimetableEntry> timetable;
        public List<Announcement> announcements;
        public FinanceSummary financeSummary;
    }

    public static class CourseRegistration {
        public String id;
        public String unitId;
        public String unitName;
        public String unitCode;
        public String semesterName;
        public String grade;
        @SerializedName("attendanceCount")
        public int attendanceCount;
        @SerializedName("totalClasses")
        public int totalClasses;
    }

    public static class TimetableEntry {
        public String id;
        public String unitName;
        public String unitCode;
        public String staffName;
        public String venue;
        public String day;
        public String timeSlot;
    }

    public static class FinanceSummary {
        public double outstandingBalance;
        public double totalPaid;
        public List<Invoice> recentInvoices;
    }

    public static class Invoice {
        public String id;
        public String description;
        public double amount;
        public String status;
        public String dueDate;
    }

    // ── Lecturer dashboard ───────────────────────────────────────────────────

    public static class LecturerDashboard {
        public Staff staff;
        public List<TeachingAssignment> assignments;
        public List<AttendanceSession> recentSessions;
        public List<Announcement> announcements;
    }

    public static class TeachingAssignment {
        public String id;
        public String unitId;
        public String unitName;
        public String unitCode;
        public String semesterName;
        public String academicYearName;
    }

    public static class AttendanceSession {
        public String id;
        public String unitId;
        public String unitName;
        public String unitCode;
        public String sessionDate;
        public String status;
        public int presentCount;
        public int totalStudents;
    }

    public static class LogAttendanceRequest {
        public String unitId;
        public String sessionDate;
        public String status;

        public LogAttendanceRequest(String unitId, String sessionDate, String status) {
            this.unitId = unitId;
            this.sessionDate = sessionDate;
            this.status = status;
        }
    }

    public static class GradeStudentRequest {
        public String studentId;
        public String unitId;
        public String grade;
        public String semesterId;

        public GradeStudentRequest(String studentId, String unitId, String grade, String semesterId) {
            this.studentId = studentId;
            this.unitId = unitId;
            this.grade = grade;
            this.semesterId = semesterId;
        }
    }

    // ── Admin dashboard ──────────────────────────────────────────────────────

    public static class AdminDashboard {
        public School school;
        public int totalStudents;
        public int totalStaff;
        public int totalPrograms;
        public int totalDepartments;
        public int activeAcademicYear;
        public List<Announcement> announcements;
    }

    // ── Super Admin ──────────────────────────────────────────────────────────

    public static class SuperStats {
        public int totalSchools;
        public int activeSchools;
        public int disabledSchools;
        public int totalAdmins;
        public int totalStaff;
        public int totalStudents;
    }

    // ── Announcements ────────────────────────────────────────────────────────

    public static class SendAnnouncementRequest {
        public String title;
        public String message;
        public String priority;

        public SendAnnouncementRequest(String title, String message, String priority) {
            this.title = title;
            this.message = message;
            this.priority = priority;
        }
    }

    // ── Library ──────────────────────────────────────────────────────────────

    public static class Book {
        public String id;
        public String title;
        public String author;
        public String isbn;
        public String categoryId;
        public String publisher;
        public int year;
        public String type;
        public int copiesCount;
        public int availableCopies;
    }

    public static class Borrowing {
        public String id;
        public String bookTitle;
        public String borrowDate;
        public String dueDate;
        public String returnDate;
        public String status;
        public int renewalsCount;
    }

    public static class LibraryFine {
        public String id;
        public double amount;
        public String reason;
        public String status;
        public String createdAt;
    }

    // ── Exam / Results ───────────────────────────────────────────────────────

    public static class ExamResult {
        public String id;
        public String unitName;
        public String unitCode;
        public String grade;
        @SerializedName("gradePoints")
        public double gradePoints;
        public String semesterName;
    }

    // ── Finance ──────────────────────────────────────────────────────────────

    public static class StudentBalance {
        public String studentId;
        public double outstandingBalance;
        public double totalPaid;
    }

    public static class PaymentRequest {
        public String studentId;
        public double amount;
        public String method;
        public String reference;

        public PaymentRequest(String studentId, double amount, String method, String reference) {
            this.studentId = studentId;
            this.amount = amount;
            this.method = method;
            this.reference = reference;
        }
    }

    // ── Attendance session models ─────────────────────────────────────────────

    public static class AttendanceSession {
        public String id;
        public String unitId;
        public String unitCode;
        public String unitName;
        public String sessionDate;
        public String status;
        public String currentQrToken;
        public String qrExpiresAt;
        public int presentCount;
        public int totalStudents;
    }

    public static class StartSessionRequest {
        @SerializedName("unitId")  public String unitId;
        @SerializedName("cohortId") public String cohortId;
        @SerializedName("venue")   public String venue;

        public StartSessionRequest(String unitId, String cohortId, String venue) {
            this.unitId = unitId;
            this.cohortId = cohortId;
            this.venue = venue;
        }
    }

    public static class StartSessionResponse {
        public AttendanceSession session;
        public String qrToken;
        public int durationSeconds;
    }

    public static class RotateQrResponse {
        public String qrToken;
        public String newQrToken;
        public int durationSeconds;
    }

    // ── School update request ─────────────────────────────────────────────────

    public static class UpdateSchoolRequest {
        @SerializedName("name")            public String name;
        @SerializedName("email")           public String email;
        @SerializedName("phone")           public String phone;
        @SerializedName("institutionType") public String institutionType;

        public UpdateSchoolRequest(String name, String email, String phone, String institutionType) {
            this.name = name;
            this.email = email;
            this.phone = phone;
            this.institutionType = institutionType;
        }
    }

    // ── HOD dashboard ─────────────────────────────────────────────────────────

    public static class HodDashboard {
        public Department department;
        public int staffCount;
        public int programCount;
        public int studentCount;
        public List<Staff> staff;
        public List<Program> programs;
        public List<Announcement> announcements;
    }

    // ── Admissions ────────────────────────────────────────────────────────────

    public static class Admission {
        public String id;
        public String applicantName;
        public String applicantEmail;
        public String applicantPhone;
        public String programId;
        public String status;
        public String refNumber;
        public String submittedAt;
        public String updatedAt;
    }

    public static class AdmissionsStats {
        public int total;
        public int submitted;
        public int admitted;
        public int rejected;
        public int underReview;
    }

    // ── Research ──────────────────────────────────────────────────────────────

    public static class ResearchSummary {
        public List<ResearchProject> projects;
        public List<Publication> publications;
    }

    public static class ResearchProject {
        public String id;
        public String title;
        public String fundingAgency;
        public double grantAmount;
        public String status;
        public String startDate;
        public String endDate;
    }

    public static class Publication {
        public String id;
        public String title;
        public String journalName;
        public String publishedDate;
        public int citationCount;
        public String authorName;
    }

    // ── Documents ─────────────────────────────────────────────────────────────

    public static class Document {
        public String id;
        public String title;
        public String type;
        public String status;
        public String createdAt;
        public String updatedAt;
    }

    // ── Generic response wrapper ─────────────────────────────────────────────

    public static class GenericResponse {
        public String message;
        public boolean success;
    }

    // ── Change password ───────────────────────────────────────────────────────

    public static class ChangePasswordRequest {
        @SerializedName("currentPassword") public String currentPassword;
        @SerializedName("newPassword")     public String newPassword;

        public ChangePasswordRequest(String current, String newPwd) {
            this.currentPassword = current;
            this.newPassword = newPwd;
        }
    }

    // ── QR Attendance ─────────────────────────────────────────────────────────

    public static class QrScanRequest {
        @SerializedName("sessionId") public String sessionId;
        @SerializedName("qrToken")   public String qrToken;

        public QrScanRequest(String sessionId, String qrToken) {
            this.sessionId = sessionId;
            this.qrToken = qrToken;
        }
    }

    public static class QrSessionData {
        public String sessionId;
        public String unitCode;
        public String unitName;
        public String currentQrToken;
        public String expiresAt;
        public String status;
    }

    // ── Finance summary ───────────────────────────────────────────────────────

    public static class FinanceSummary {
        public double totalInvoiced;
        public double totalCollected;
        public double outstanding;
        public int invoiceCount;
        public int paidCount;
        public int pendingCount;
        public List<Invoice> recentInvoices;
    }

    // ── Admin user (for super-admin admins list) ──────────────────────────────

    public static class AdminUser {
        public String id;
        public String name;
        public String email;
        public String phone;
        public String schoolId;
        public String schoolName;
    }
}
