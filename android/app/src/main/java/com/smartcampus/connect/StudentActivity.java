package com.smartcampus.connect;

import android.content.Intent;
import android.os.Bundle;
import android.view.MenuItem;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.viewpager2.widget.ViewPager2;

import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.tabs.TabLayout;
import com.google.android.material.tabs.TabLayoutMediator;
import com.smartcampus.connect.api.ApiClient;
import com.smartcampus.connect.api.ApiService;
import com.smartcampus.connect.models.DashboardModels;
import com.smartcampus.connect.utils.SessionManager;
import com.smartcampus.connect.utils.UiHelper;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class StudentActivity extends AppCompatActivity {

    private SessionManager session;
    private ApiService api;

    // Tabs
    private static final String[] TAB_TITLES = {"Overview", "Courses", "Timetable", "Results", "Finance", "Library"};

    // Fragment views (held in the ViewPager adapter by index)
    private final View[] tabViews = new View[TAB_TITLES.length];

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_student);

        session = new SessionManager(this);
        api = ApiClient.getClient(session.getBaseUrl());

        // Toolbar
        MaterialToolbar toolbar = findViewById(R.id.toolbar_student);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayShowTitleEnabled(false);
        }

        // Header labels
        ((TextView) findViewById(R.id.tv_student_welcome)).setText("Welcome, " + session.getName());
        ((TextView) findViewById(R.id.tv_student_regnum)).setText("Reg No: " + session.getRegNumber());

        // Setup bottom nav
        BottomNavigationView bottomNav = findViewById(R.id.bottom_nav_student);
        TabLayout tabLayout = findViewById(R.id.tab_layout_student);
        ViewPager2 pager = findViewById(R.id.pager_student);

        // Simple fragment adapter using the fragment_dashboard_cards layout
        pager.setAdapter(new DashboardPagerAdapter(this, TAB_TITLES.length));

        new TabLayoutMediator(tabLayout, pager,
                (tab, pos) -> tab.setText(TAB_TITLES[pos])).attach();

        bottomNav.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
            if      (id == R.id.nav_home)    pager.setCurrentItem(0);
            else if (id == R.id.nav_courses) pager.setCurrentItem(1);
            else if (id == R.id.nav_results) pager.setCurrentItem(3);
            else if (id == R.id.nav_finance) pager.setCurrentItem(4);
            else if (id == R.id.nav_profile) startActivity(new Intent(this, ProfileActivity.class));
            return true;
        });

        // Toolbar logout menu is handled in onOptionsItemSelected
    }

    // ── Data loading called from fragments ────────────────────────────────────

    public void loadRegistrations(LinearLayout container, ProgressBar pb, TextView emptyTv) {
        pb.setVisibility(View.VISIBLE);
        api.getMyRegistrations(session.getAuthHeader()).enqueue(new Callback<List<DashboardModels.CourseRegistration>>() {
            @Override public void onResponse(@NonNull Call<List<DashboardModels.CourseRegistration>> c,
                                             @NonNull Response<List<DashboardModels.CourseRegistration>> r) {
                pb.setVisibility(View.GONE);
                if (r.isSuccessful() && r.body() != null && !r.body().isEmpty()) {
                    container.removeAllViews();
                    for (DashboardModels.CourseRegistration reg : r.body()) {
                        String att = reg.totalClasses > 0
                                ? "Attendance: " + reg.attendanceCount + "/" + reg.totalClasses
                                : "No attendance recorded";
                        String grade = (reg.grade != null && !reg.grade.equals("-")) ? reg.grade : "Pending";
                        UiHelper.addCard(container,
                                reg.unitCode + " — " + reg.unitName,
                                reg.semesterName,
                                att,
                                "Grade: " + grade,
                                grade.equals("A") ? "#10b981" : "#94a3b8");
                    }
                } else { emptyTv.setVisibility(View.VISIBLE); }
            }
            @Override public void onFailure(@NonNull Call<List<DashboardModels.CourseRegistration>> c,
                                            @NonNull Throwable t) {
                pb.setVisibility(View.GONE);
                UiHelper.showToast(StudentActivity.this, "Failed to load courses.");
            }
        });
    }

    public void loadTranscript(LinearLayout container, ProgressBar pb, TextView emptyTv) {
        pb.setVisibility(View.VISIBLE);
        api.getTranscript(session.getAuthHeader()).enqueue(new Callback<List<DashboardModels.ExamResult>>() {
            @Override public void onResponse(@NonNull Call<List<DashboardModels.ExamResult>> c,
                                             @NonNull Response<List<DashboardModels.ExamResult>> r) {
                pb.setVisibility(View.GONE);
                if (r.isSuccessful() && r.body() != null && !r.body().isEmpty()) {
                    container.removeAllViews();
                    for (DashboardModels.ExamResult res : r.body()) {
                        UiHelper.addCard(container,
                                res.unitCode + " — " + res.unitName,
                                res.semesterName,
                                "Grade Points: " + res.gradePoints,
                                res.grade,
                                UiHelper.statusColor(res.grade));
                    }
                } else { emptyTv.setVisibility(View.VISIBLE); }
            }
            @Override public void onFailure(@NonNull Call<List<DashboardModels.ExamResult>> c,
                                            @NonNull Throwable t) {
                pb.setVisibility(View.GONE);
            }
        });
    }

    public void loadInvoices(LinearLayout container, ProgressBar pb, TextView emptyTv,
                             TextView stat1Val, TextView stat2Val) {
        pb.setVisibility(View.VISIBLE);
        api.getInvoices(session.getAuthHeader()).enqueue(new Callback<List<DashboardModels.Invoice>>() {
            @Override public void onResponse(@NonNull Call<List<DashboardModels.Invoice>> c,
                                             @NonNull Response<List<DashboardModels.Invoice>> r) {
                pb.setVisibility(View.GONE);
                if (r.isSuccessful() && r.body() != null) {
                    List<DashboardModels.Invoice> list = r.body();
                    double outstanding = list.stream()
                            .filter(inv -> !"paid".equalsIgnoreCase(inv.status))
                            .mapToDouble(inv -> inv.amount).sum();
                    double paid = list.stream()
                            .filter(inv -> "paid".equalsIgnoreCase(inv.status))
                            .mapToDouble(inv -> inv.amount).sum();
                    stat1Val.setText(String.format("KES %.0f", outstanding));
                    stat2Val.setText(String.format("KES %.0f", paid));
                    container.removeAllViews();
                    for (DashboardModels.Invoice inv : list) {
                        UiHelper.addCard(container, inv.description,
                                "Due: " + inv.dueDate,
                                "Amount: KES " + inv.amount,
                                inv.status.toUpperCase(),
                                UiHelper.statusColor(inv.status));
                    }
                    if (list.isEmpty()) emptyTv.setVisibility(View.VISIBLE);
                }
            }
            @Override public void onFailure(@NonNull Call<List<DashboardModels.Invoice>> c,
                                            @NonNull Throwable t) {
                pb.setVisibility(View.GONE);
            }
        });
    }

    public void loadLibraryBorrowings(LinearLayout container, ProgressBar pb, TextView emptyTv) {
        pb.setVisibility(View.VISIBLE);
        api.getBorrowings(session.getAuthHeader()).enqueue(new Callback<List<DashboardModels.Borrowing>>() {
            @Override public void onResponse(@NonNull Call<List<DashboardModels.Borrowing>> c,
                                             @NonNull Response<List<DashboardModels.Borrowing>> r) {
                pb.setVisibility(View.GONE);
                if (r.isSuccessful() && r.body() != null && !r.body().isEmpty()) {
                    container.removeAllViews();
                    for (DashboardModels.Borrowing b : r.body()) {
                        UiHelper.addCard(container,
                                b.bookTitle,
                                "Borrowed: " + b.borrowDate,
                                "Due: " + b.dueDate,
                                b.status.toUpperCase(),
                                UiHelper.statusColor(b.status));
                    }
                } else { emptyTv.setVisibility(View.VISIBLE); }
            }
            @Override public void onFailure(@NonNull Call<List<DashboardModels.Borrowing>> c,
                                            @NonNull Throwable t) {
                pb.setVisibility(View.GONE);
            }
        });
    }

    public void loadTimetable(LinearLayout container, ProgressBar pb, TextView emptyTv) {
        pb.setVisibility(View.VISIBLE);
        api.getTimetables(session.getAuthHeader()).enqueue(new Callback<List<DashboardModels.TimetableEntry>>() {
            @Override public void onResponse(@NonNull Call<List<DashboardModels.TimetableEntry>> c,
                                             @NonNull Response<List<DashboardModels.TimetableEntry>> r) {
                pb.setVisibility(View.GONE);
                if (r.isSuccessful() && r.body() != null && !r.body().isEmpty()) {
                    container.removeAllViews();
                    for (DashboardModels.TimetableEntry tt : r.body()) {
                        UiHelper.addCard(container,
                                tt.unitCode + " — " + tt.unitName,
                                tt.day + " | " + tt.timeSlot,
                                "Venue: " + tt.venue + " | Lecturer: " + tt.staffName,
                                tt.day, "#4f46e5");
                    }
                } else { emptyTv.setVisibility(View.VISIBLE); }
            }
            @Override public void onFailure(@NonNull Call<List<DashboardModels.TimetableEntry>> c,
                                            @NonNull Throwable t) {
                pb.setVisibility(View.GONE);
            }
        });
    }

    public void loadAnnouncements(LinearLayout container, ProgressBar pb, TextView emptyTv) {
        pb.setVisibility(View.VISIBLE);
        api.getAnnouncements(session.getAuthHeader()).enqueue(new Callback<List<DashboardModels.Announcement>>() {
            @Override public void onResponse(@NonNull Call<List<DashboardModels.Announcement>> c,
                                             @NonNull Response<List<DashboardModels.Announcement>> r) {
                pb.setVisibility(View.GONE);
                if (r.isSuccessful() && r.body() != null && !r.body().isEmpty()) {
                    for (DashboardModels.Announcement a : r.body()) {
                        String badgeColor = "HIGH".equalsIgnoreCase(a.priority) ? "#ef4444" : "#f59e0b";
                        UiHelper.addCard(container, a.title, a.message,
                                "From: " + a.senderName, a.priority, badgeColor);
                    }
                }
            }
            @Override public void onFailure(@NonNull Call<List<DashboardModels.Announcement>> c,
                                            @NonNull Throwable t) {
                pb.setVisibility(View.GONE);
            }
        });
    }

    public void logout() {
        api.logout(session.getAuthHeader()).enqueue(new Callback<DashboardModels.GenericResponse>() {
            @Override public void onResponse(@NonNull Call<DashboardModels.GenericResponse> c,
                                             @NonNull Response<DashboardModels.GenericResponse> r) {}
            @Override public void onFailure(@NonNull Call<DashboardModels.GenericResponse> c,
                                            @NonNull Throwable t) {}
        });
        session.clear();
        Intent i = new Intent(this, LoginActivity.class);
        i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(i);
        finish();
    }
}
