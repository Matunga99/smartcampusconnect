package com.smartcampus.connect;

import android.content.Intent;
import android.os.Bundle;
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

public class AdminActivity extends AppCompatActivity {

    private SessionManager session;
    private ApiService api;
    private static final String[] TAB_TITLES = {"Dashboard", "Students", "Staff", "Academics", "Profile"};

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_admin);

        session = new SessionManager(this);
        api = ApiClient.getClient(session.getBaseUrl());

        MaterialToolbar toolbar = findViewById(R.id.toolbar_admin);
        setSupportActionBar(toolbar);

        ((TextView) findViewById(R.id.tv_admin_welcome)).setText("Welcome, " + session.getName());
        ((TextView) findViewById(R.id.tv_admin_school)).setText("Institution ID: " + session.getSchoolId());

        TabLayout tabLayout = findViewById(R.id.tab_layout_admin);
        ViewPager2 pager    = findViewById(R.id.pager_admin);
        pager.setAdapter(new DashboardPagerAdapter(this, TAB_TITLES.length));
        new TabLayoutMediator(tabLayout, pager, (tab, pos) -> tab.setText(TAB_TITLES[pos])).attach();

        BottomNavigationView bottomNav = findViewById(R.id.bottom_nav_admin);
        bottomNav.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
            if      (id == R.id.nav_home)      pager.setCurrentItem(0);
            else if (id == R.id.nav_students)   pager.setCurrentItem(1);
            else if (id == R.id.nav_staff)      pager.setCurrentItem(2);
            else if (id == R.id.nav_academics)  pager.setCurrentItem(3);
            else if (id == R.id.nav_profile)    openProfile();
            return true;
        });
    }

    // ── Data loaders ──────────────────────────────────────────────────────────

    public void loadDashboard(TextView stat1Val, TextView stat2Val,
                              LinearLayout container, ProgressBar pb, TextView emptyTv) {
        pb.setVisibility(View.VISIBLE);
        api.getAdminDashboard(session.getAuthHeader()).enqueue(new Callback<DashboardModels.AdminDashboard>() {
            @Override public void onResponse(@NonNull Call<DashboardModels.AdminDashboard> c,
                                             @NonNull Response<DashboardModels.AdminDashboard> r) {
                pb.setVisibility(View.GONE);
                if (r.isSuccessful() && r.body() != null) {
                    DashboardModels.AdminDashboard d = r.body();
                    stat1Val.setText(String.valueOf(d.totalStudents));
                    stat2Val.setText(String.valueOf(d.totalStaff));
                    container.removeAllViews();
                    if (d.school != null) {
                        UiHelper.addCard(container, d.school.name,
                                d.school.institutionType + " | Code: " + d.school.code,
                                "Email: " + d.school.email,
                                d.school.disabled ? "DISABLED" : "ACTIVE",
                                d.school.disabled ? "#ef4444" : "#10b981");
                    }
                    UiHelper.addCard(container, "Programs", String.valueOf(d.totalPrograms) + " registered programs",
                            String.valueOf(d.totalDepartments) + " departments", null, null);
                    if (d.announcements != null) {
                        for (DashboardModels.Announcement a : d.announcements) {
                            UiHelper.addCard(container, a.title, a.message,
                                    "Priority: " + a.priority, a.priority,
                                    "HIGH".equalsIgnoreCase(a.priority) ? "#ef4444" : "#f59e0b");
                        }
                    }
                } else { emptyTv.setVisibility(View.VISIBLE); }
            }
            @Override public void onFailure(@NonNull Call<DashboardModels.AdminDashboard> c,
                                            @NonNull Throwable t) { pb.setVisibility(View.GONE); }
        });
    }

    public void loadStudents(LinearLayout container, ProgressBar pb, TextView emptyTv) {
        pb.setVisibility(View.VISIBLE);
        api.getStudents(session.getAuthHeader()).enqueue(new Callback<List<DashboardModels.Student>>() {
            @Override public void onResponse(@NonNull Call<List<DashboardModels.Student>> c,
                                             @NonNull Response<List<DashboardModels.Student>> r) {
                pb.setVisibility(View.GONE);
                if (r.isSuccessful() && r.body() != null && !r.body().isEmpty()) {
                    container.removeAllViews();
                    for (DashboardModels.Student s : r.body()) {
                        UiHelper.addCard(container, s.name,
                                "Reg: " + s.regNumber + " | " + s.programName,
                                "Level: " + s.currentLevel + " | " + s.currentSemester,
                                s.status, UiHelper.statusColor(s.status));
                    }
                } else { emptyTv.setVisibility(View.VISIBLE); }
            }
            @Override public void onFailure(@NonNull Call<List<DashboardModels.Student>> c,
                                            @NonNull Throwable t) { pb.setVisibility(View.GONE); }
        });
    }

    public void loadStaff(LinearLayout container, ProgressBar pb, TextView emptyTv) {
        pb.setVisibility(View.VISIBLE);
        api.getStaff(session.getAuthHeader()).enqueue(new Callback<List<DashboardModels.Staff>>() {
            @Override public void onResponse(@NonNull Call<List<DashboardModels.Staff>> c,
                                             @NonNull Response<List<DashboardModels.Staff>> r) {
                pb.setVisibility(View.GONE);
                if (r.isSuccessful() && r.body() != null && !r.body().isEmpty()) {
                    container.removeAllViews();
                    for (DashboardModels.Staff s : r.body()) {
                        UiHelper.addCard(container, s.name,
                                s.role + " | " + s.departmentName,
                                "Email: " + s.email, "STAFF", "#4f46e5");
                    }
                } else { emptyTv.setVisibility(View.VISIBLE); }
            }
            @Override public void onFailure(@NonNull Call<List<DashboardModels.Staff>> c,
                                            @NonNull Throwable t) { pb.setVisibility(View.GONE); }
        });
    }

    public void loadAcademicYears(LinearLayout container, ProgressBar pb, TextView emptyTv) {
        pb.setVisibility(View.VISIBLE);
        api.getAcademicYears(session.getAuthHeader()).enqueue(new Callback<List<DashboardModels.AcademicYear>>() {
            @Override public void onResponse(@NonNull Call<List<DashboardModels.AcademicYear>> c,
                                             @NonNull Response<List<DashboardModels.AcademicYear>> r) {
                pb.setVisibility(View.GONE);
                if (r.isSuccessful() && r.body() != null && !r.body().isEmpty()) {
                    container.removeAllViews();
                    for (DashboardModels.AcademicYear ay : r.body()) {
                        UiHelper.addCard(container, ay.name,
                                ay.startDate + " → " + ay.endDate,
                                null, ay.status.toUpperCase(),
                                UiHelper.statusColor(ay.status));
                    }
                } else { emptyTv.setVisibility(View.VISIBLE); }
            }
            @Override public void onFailure(@NonNull Call<List<DashboardModels.AcademicYear>> c,
                                            @NonNull Throwable t) { pb.setVisibility(View.GONE); }
        });
    }

    public void openProfile() {
        startActivity(new Intent(this, ProfileActivity.class));
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
