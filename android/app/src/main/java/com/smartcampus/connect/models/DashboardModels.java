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

    // ── Generic response wrapper ─────────────────────────────────────────────

    public static class GenericResponse {
        public String message;
        public boolean success;
    }
}
