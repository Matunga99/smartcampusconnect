package com.smartcampus.connect.sdk.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

/**
 * All SDK data models — mirrors DashboardModels in the app module.
 */
public class SdkModels {

    public static class GenericResponse {
        public String message;
        public boolean success;
    }

    public static class School {
        public String id;
        public String name;
        public String code;
        public String email;
        public String phone;
        public String institutionType;
        public boolean disabled;
    }

    public static class Student {
        public String id;
        public String name;
        public String regNumber;
        public String programName;
        public String status;
        public String currentLevel;
        public String currentSemester;
    }

    public static class Staff {
        public String id;
        public String name;
        public String email;
        public String role;
        public String departmentName;
    }

    public static class AcademicYear {
        public String id;
        public String name;
        public String startDate;
        public String endDate;
        public String status;
    }

    public static class CourseRegistration {
        public String id;
        public String unitId;
        public String unitName;
        public String unitCode;
        public String semesterName;
        public String grade;
        public int attendanceCount;
        public int totalClasses;
    }

    public static class TeachingAssignment {
        public String id;
        public String unitId;
        public String unitName;
        public String unitCode;
        public String semesterName;
        public String academicYearName;
    }

    public static class ExamResult {
        public String id;
        public String unitName;
        public String unitCode;
        public String grade;
        @SerializedName("gradePoints")
        public double gradePoints;
        public String semesterName;
    }

    public static class Announcement {
        public String id;
        public String title;
        public String message;
        public String priority;
        public String senderName;
        public String createdAt;
    }

    public static class Invoice {
        public String id;
        public String description;
        public double amount;
        public String status;
        public String dueDate;
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

    public static class AdminDashboard {
        public School school;
        public int totalStudents;
        public int totalStaff;
        public int totalPrograms;
        public int totalDepartments;
        public List<Announcement> announcements;
    }

    public static class StudentDashboard {
        public Student student;
        public List<CourseRegistration> registrations;
        public List<Announcement> announcements;
    }

    public static class SuperStats {
        public int totalSchools;
        public int activeSchools;
        public int disabledSchools;
        public int totalAdmins;
        public int totalStaff;
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
}
