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

public class LecturerActivity extends AppCompatActivity {

    private SessionManager session;
    private ApiService api;
    private static final String[] TAB_TITLES = {"Overview", "My Units", "Attendance", "Grades", "Profile"};

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_lecturer);

        session = new SessionManager(this);
        api = ApiClient.getClient(session.getBaseUrl());

        MaterialToolbar toolbar = findViewById(R.id.toolbar_lecturer);
        setSupportActionBar(toolbar);

        ((TextView) findViewById(R.id.tv_lecturer_welcome)).setText("Welcome, " + session.getName());
        ((TextView) findViewById(R.id.tv_lecturer_school)).setText("School ID: " + session.getSchoolId());

        TabLayout tabLayout = findViewById(R.id.tab_layout_lecturer);
        ViewPager2 pager    = findViewById(R.id.pager_lecturer);
        pager.setAdapter(new DashboardPagerAdapter(this, TAB_TITLES.length));
        new TabLayoutMediator(tabLayout, pager, (tab, pos) -> tab.setText(TAB_TITLES[pos])).attach();

        BottomNavigationView bottomNav = findViewById(R.id.bottom_nav_lecturer);
        bottomNav.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
            if      (id == R.id.nav_home)       pager.setCurrentItem(0);
            else if (id == R.id.nav_units)       pager.setCurrentItem(1);
            else if (id == R.id.nav_attendance)  pager.setCurrentItem(2);
            else if (id == R.id.nav_grades)      pager.setCurrentItem(3);
            else if (id == R.id.nav_profile)     openProfile();
            return true;
        });
    }

    // ── Data loaders ──────────────────────────────────────────────────────────

    public void loadAnnouncements(LinearLayout container, ProgressBar pb, TextView emptyTv, TextView stat1Val) {
        pb.setVisibility(View.VISIBLE);
        api.getAnnouncements(session.getAuthHeader()).enqueue(new Callback<List<DashboardModels.Announcement>>() {
            @Override public void onResponse(@NonNull Call<List<DashboardModels.Announcement>> c,
                                             @NonNull Response<List<DashboardModels.Announcement>> r) {
                pb.setVisibility(View.GONE);
                if (r.isSuccessful() && r.body() != null) {
                    stat1Val.setText(String.valueOf(r.body().size()));
                    for (DashboardModels.Announcement a : r.body()) {
                        UiHelper.addCard(container, a.title, a.message,
                                "From: " + a.senderName,
                                a.priority, "HIGH".equalsIgnoreCase(a.priority) ? "#ef4444" : "#f59e0b");
                    }
                    if (r.body().isEmpty()) emptyTv.setVisibility(View.VISIBLE);
                }
            }
            @Override public void onFailure(@NonNull Call<List<DashboardModels.Announcement>> c,
                                            @NonNull Throwable t) { pb.setVisibility(View.GONE); }
        });
    }

    public void loadMyUnits(LinearLayout container, ProgressBar pb, TextView emptyTv) {
        pb.setVisibility(View.VISIBLE);
        api.getMyUnits(session.getAuthHeader()).enqueue(new Callback<List<DashboardModels.TeachingAssignment>>() {
            @Override public void onResponse(@NonNull Call<List<DashboardModels.TeachingAssignment>> c,
                                             @NonNull Response<List<DashboardModels.TeachingAssignment>> r) {
                pb.setVisibility(View.GONE);
                if (r.isSuccessful() && r.body() != null && !r.body().isEmpty()) {
                    container.removeAllViews();
                    for (DashboardModels.TeachingAssignment ta : r.body()) {
                        UiHelper.addCard(container,
                                ta.unitCode + " — " + ta.unitName,
                                ta.semesterName + " | " + ta.academicYearName,
                                null, "ASSIGNED", "#4f46e5");
                    }
                } else { emptyTv.setVisibility(View.VISIBLE); }
            }
            @Override public void onFailure(@NonNull Call<List<DashboardModels.TeachingAssignment>> c,
                                            @NonNull Throwable t) { pb.setVisibility(View.GONE); }
        });
    }

    public void loadAttendanceSessions(LinearLayout container, ProgressBar pb, TextView emptyTv) {
        // Attendance sessions are logged — show info card with prompt
        pb.setVisibility(View.GONE);
        UiHelper.addCard(container,
                "Log Attendance Session",
                "To start an attendance session, tap 'My Units' and select a unit.",
                "QR-based attendance is available on the full web platform",
                "INFO", "#4f46e5");
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
