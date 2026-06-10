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

public class SuperAdminActivity extends AppCompatActivity {

    private SessionManager session;
    private ApiService api;
    private static final String[] TAB_TITLES = {"Overview", "Schools", "Profile"};

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_super_admin);

        session = new SessionManager(this);
        api = ApiClient.getClient(session.getBaseUrl());

        MaterialToolbar toolbar = findViewById(R.id.toolbar_super);
        setSupportActionBar(toolbar);

        ((TextView) findViewById(R.id.tv_admin_welcome)).setText("Welcome, " + session.getName());
        ((TextView) findViewById(R.id.tv_tenant_desc)).setText("Global Multi-Institution Scope — All Schools");

        TabLayout tabLayout = findViewById(R.id.tab_layout_super);
        ViewPager2 pager    = findViewById(R.id.pager_super);
        pager.setAdapter(new DashboardPagerAdapter(this, TAB_TITLES.length));
        new TabLayoutMediator(tabLayout, pager, (tab, pos) -> tab.setText(TAB_TITLES[pos])).attach();

        BottomNavigationView bottomNav = findViewById(R.id.bottom_nav_super);
        bottomNav.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
            if      (id == R.id.nav_home)    pager.setCurrentItem(0);
            else if (id == R.id.nav_schools) pager.setCurrentItem(1);
            else if (id == R.id.nav_profile) openProfile();
            return true;
        });
    }

    // ── Data loaders ──────────────────────────────────────────────────────────

    public void loadStats(TextView stat1Val, TextView stat2Val,
                          LinearLayout container, ProgressBar pb, TextView emptyTv) {
        pb.setVisibility(View.VISIBLE);
        api.getSuperStats(session.getAuthHeader()).enqueue(new Callback<DashboardModels.SuperStats>() {
            @Override public void onResponse(@NonNull Call<DashboardModels.SuperStats> c,
                                             @NonNull Response<DashboardModels.SuperStats> r) {
                pb.setVisibility(View.GONE);
                if (r.isSuccessful() && r.body() != null) {
                    DashboardModels.SuperStats s = r.body();
                    stat1Val.setText(String.valueOf(s.totalSchools));
                    stat2Val.setText(String.valueOf(s.activeSchools));
                    container.removeAllViews();
                    UiHelper.addCard(container, "Total Students",
                            String.valueOf(s.totalStudents) + " enrolled students across all institutions",
                            null, "GLOBAL", "#a855f7");
                    UiHelper.addCard(container, "Total Staff",
                            String.valueOf(s.totalStaff) + " staff members",
                            null, "ACTIVE", "#10b981");
                    UiHelper.addCard(container, "Total Admins",
                            String.valueOf(s.totalAdmins) + " institutional administrators",
                            null, "ADMIN", "#3b82f6");
                } else { emptyTv.setVisibility(View.VISIBLE); }
            }
            @Override public void onFailure(@NonNull Call<DashboardModels.SuperStats> c,
                                            @NonNull Throwable t) { pb.setVisibility(View.GONE); }
        });
    }

    public void loadSchools(LinearLayout container, ProgressBar pb, TextView emptyTv) {
        pb.setVisibility(View.VISIBLE);
        api.getSchools(session.getAuthHeader()).enqueue(new Callback<List<DashboardModels.School>>() {
            @Override public void onResponse(@NonNull Call<List<DashboardModels.School>> c,
                                             @NonNull Response<List<DashboardModels.School>> r) {
                pb.setVisibility(View.GONE);
                if (r.isSuccessful() && r.body() != null && !r.body().isEmpty()) {
                    container.removeAllViews();
                    for (DashboardModels.School school : r.body()) {
                        UiHelper.addCard(container,
                                school.name,
                                school.institutionType + " | Code: " + school.code,
                                "Email: " + school.email,
                                school.disabled ? "DISABLED" : "ACTIVE",
                                school.disabled ? "#ef4444" : "#10b981");
                    }
                } else { emptyTv.setVisibility(View.VISIBLE); }
            }
            @Override public void onFailure(@NonNull Call<List<DashboardModels.School>> c,
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
