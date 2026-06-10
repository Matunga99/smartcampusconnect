package com.smartcampus.connect.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.smartcampus.connect.AdminActivity;
import com.smartcampus.connect.LecturerActivity;
import com.smartcampus.connect.R;
import com.smartcampus.connect.StudentActivity;
import com.smartcampus.connect.SuperAdminActivity;
import com.smartcampus.connect.utils.UiHelper;

/**
 * A single tab fragment used across all role dashboards.
 * Delegates to the host Activity for data loading based on tabIndex.
 */
public class DashboardTabFragment extends Fragment {

    private static final String ARG_TAB = "tab_index";

    public static DashboardTabFragment newInstance(int tabIndex) {
        DashboardTabFragment f = new DashboardTabFragment();
        Bundle args = new Bundle();
        args.putInt(ARG_TAB, tabIndex);
        f.setArguments(args);
        return f;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_dashboard_cards, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        int tabIndex = getArguments() != null ? getArguments().getInt(ARG_TAB, 0) : 0;

        LinearLayout itemsContainer = view.findViewById(R.id.ll_items_container);
        ProgressBar progressBar     = view.findViewById(R.id.progress_bar);
        TextView emptyTv            = view.findViewById(R.id.tv_empty);
        TextView stat1Val           = view.findViewById(R.id.tv_stat1_value);
        TextView stat2Val           = view.findViewById(R.id.tv_stat2_value);
        TextView stat1Label         = view.findViewById(R.id.tv_stat1_label);
        TextView stat2Label         = view.findViewById(R.id.tv_stat2_label);
        TextView sectionTitle       = view.findViewById(R.id.tv_section_title);

        // ── Student host ──────────────────────────────────────────────────────
        if (requireActivity() instanceof StudentActivity) {
            StudentActivity host = (StudentActivity) requireActivity();
            switch (tabIndex) {
                case 0: // Overview
                    sectionTitle.setText("Announcements");
                    stat1Label.setText("Courses");
                    stat2Label.setText("Role");
                    stat1Val.setText("Active");
                    stat2Val.setText("STUDENT");
                    host.loadAnnouncements(itemsContainer, progressBar, emptyTv);
                    break;
                case 1: // Courses
                    sectionTitle.setText("Registered Units");
                    stat1Label.setText("Units");
                    stat2Label.setText("Semester");
                    host.loadRegistrations(itemsContainer, progressBar, emptyTv);
                    break;
                case 2: // Timetable
                    sectionTitle.setText("Class Schedule");
                    stat1Label.setText("Sessions");
                    stat2Label.setText("Venues");
                    host.loadTimetable(itemsContainer, progressBar, emptyTv);
                    break;
                case 3: // Results
                    sectionTitle.setText("Exam Results & Transcript");
                    stat1Label.setText("Grades");
                    stat2Label.setText("GPA");
                    host.loadTranscript(itemsContainer, progressBar, emptyTv);
                    break;
                case 4: // Finance
                    sectionTitle.setText("Invoices & Fees");
                    stat1Label.setText("Outstanding (KES)");
                    stat2Label.setText("Paid (KES)");
                    host.loadInvoices(itemsContainer, progressBar, emptyTv, stat1Val, stat2Val);
                    break;
                case 5: // Library
                    sectionTitle.setText("My Borrowings");
                    stat1Label.setText("Active");
                    stat2Label.setText("Overdue");
                    host.loadLibraryBorrowings(itemsContainer, progressBar, emptyTv);
                    break;
            }
        }

        // ── Lecturer host ─────────────────────────────────────────────────────
        else if (requireActivity() instanceof LecturerActivity) {
            LecturerActivity host = (LecturerActivity) requireActivity();
            switch (tabIndex) {
                case 0: // Overview
                    sectionTitle.setText("Announcements");
                    stat1Label.setText("Units");
                    stat2Label.setText("Role");
                    stat2Val.setText("STAFF");
                    host.loadAnnouncements(itemsContainer, progressBar, emptyTv, stat1Val);
                    break;
                case 1: // My Units
                    sectionTitle.setText("Teaching Assignments");
                    host.loadMyUnits(itemsContainer, progressBar, emptyTv);
                    break;
                case 2: // Attendance
                    sectionTitle.setText("Attendance Sessions");
                    host.loadAttendanceSessions(itemsContainer, progressBar, emptyTv);
                    break;
                case 3: // Grades
                    sectionTitle.setText("Grade Students");
                    UiHelper.addCard(itemsContainer,
                            "Grading Console",
                            "Use the web portal for batch grading",
                            "Open SmartCampusConnect on your browser",
                            "INFO", "#4f46e5");
                    break;
                case 4: // Profile
                    host.openProfile();
                    break;
            }
        }

        // ── Admin host ────────────────────────────────────────────────────────
        else if (requireActivity() instanceof AdminActivity) {
            AdminActivity host = (AdminActivity) requireActivity();
            switch (tabIndex) {
                case 0: // Dashboard
                    sectionTitle.setText("School Overview");
                    stat1Label.setText("Students");
                    stat2Label.setText("Staff");
                    host.loadDashboard(stat1Val, stat2Val, itemsContainer, progressBar, emptyTv);
                    break;
                case 1: // Students
                    sectionTitle.setText("Students Directory");
                    host.loadStudents(itemsContainer, progressBar, emptyTv);
                    break;
                case 2: // Staff
                    sectionTitle.setText("Staff Directory");
                    host.loadStaff(itemsContainer, progressBar, emptyTv);
                    break;
                case 3: // Academics
                    sectionTitle.setText("Academic Years");
                    host.loadAcademicYears(itemsContainer, progressBar, emptyTv);
                    break;
                case 4: // Profile
                    host.openProfile();
                    break;
            }
        }

        // ── Super Admin host ──────────────────────────────────────────────────
        else if (requireActivity() instanceof SuperAdminActivity) {
            SuperAdminActivity host = (SuperAdminActivity) requireActivity();
            switch (tabIndex) {
                case 0: // Overview
                    sectionTitle.setText("Platform Overview");
                    stat1Label.setText("Total Schools");
                    stat2Label.setText("Active Schools");
                    host.loadStats(stat1Val, stat2Val, itemsContainer, progressBar, emptyTv);
                    break;
                case 1: // Schools
                    sectionTitle.setText("All Institutions");
                    host.loadSchools(itemsContainer, progressBar, emptyTv);
                    break;
                case 2: // Profile
                    host.openProfile();
                    break;
            }
        }
    }
}
