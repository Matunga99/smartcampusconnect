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

/**
 * Generic dashboard for roles that don't have a dedicated Activity:
 * parent, registrar, bursar, hod, dean, principal, deputyprincipal,
 * boardmember, alumni, securityofficer, librarian, hostelmanager,
 * transportmanager, hrofficer, procurementofficer.
 *
 * It adapts its title, accent colour, and tabs based on the stored role.
 */
public class GenericRoleDashboard extends AppCompatActivity {

    private SessionManager session;
    private ApiService api;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_generic_role);

        session = new SessionManager(this);
        api = ApiClient.getClient(session.getBaseUrl());

        String role = session.getRole();

        MaterialToolbar toolbar = findViewById(R.id.toolbar_generic);
        setSupportActionBar(toolbar);

        // Header
        ((TextView) findViewById(R.id.tv_generic_badge)).setText(roleLabel(role));
        ((TextView) findViewById(R.id.tv_generic_welcome)).setText("Welcome, " + session.getName());
        ((TextView) findViewById(R.id.tv_generic_sub)).setText(roleSub(role));

        // Tabs
        String[] tabs = tabsForRole(role);
        TabLayout tabLayout = findViewById(R.id.tab_layout_generic);
        ViewPager2 pager = findViewById(R.id.pager_generic);
        pager.setAdapter(new GenericRoleAdapter(this, tabs.length, role));
        new TabLayoutMediator(tabLayout, pager, (tab, pos) -> tab.setText(tabs[pos])).attach();

        // Bottom nav
        BottomNavigationView nav = findViewById(R.id.bottom_nav_generic);
        nav.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
            if (id == R.id.nav_home) pager.setCurrentItem(0);
            else if (id == R.id.nav_profile) openProfile();
            else if (id == R.id.nav_logout) logout();
            return true;
        });
    }

    // ── Data loaders called by GenericRoleFragment ────────────────────────────

    public void loadAnnouncements(LinearLayout container, ProgressBar pb, TextView empty) {
        pb.setVisibility(View.VISIBLE);
        api.getAnnouncements(session.getAuthHeader()).enqueue(new Callback<List<DashboardModels.Announcement>>() {
            @Override public void onResponse(@NonNull Call<List<DashboardModels.Announcement>> c,
                                             @NonNull Response<List<DashboardModels.Announcement>> r) {
                pb.setVisibility(View.GONE);
                if (r.isSuccessful() && r.body() != null && !r.body().isEmpty()) {
                    for (DashboardModels.Announcement a : r.body())
                        UiHelper.addCard(container, a.title, a.message, "From: " + a.senderName,
                                a.priority, "HIGH".equalsIgnoreCase(a.priority) ? "#ef4444" : "#f59e0b");
                } else empty.setVisibility(View.VISIBLE);
            }
            @Override public void onFailure(@NonNull Call<List<DashboardModels.Announcement>> c,
                                            @NonNull Throwable t) { pb.setVisibility(View.GONE); }
        });
    }

    public void loadStudents(LinearLayout container, ProgressBar pb, TextView empty) {
        pb.setVisibility(View.VISIBLE);
        api.getStudents(session.getAuthHeader()).enqueue(new Callback<List<DashboardModels.Student>>() {
            @Override public void onResponse(@NonNull Call<List<DashboardModels.Student>> c,
                                             @NonNull Response<List<DashboardModels.Student>> r) {
                pb.setVisibility(View.GONE);
                if (r.isSuccessful() && r.body() != null && !r.body().isEmpty()) {
                    for (DashboardModels.Student s : r.body())
                        UiHelper.addCard(container, s.name,
                                "Reg: " + s.regNumber + " | " + s.programName,
                                "Level: " + s.currentLevel, s.status, UiHelper.statusColor(s.status));
                } else empty.setVisibility(View.VISIBLE);
            }
            @Override public void onFailure(@NonNull Call<List<DashboardModels.Student>> c,
                                            @NonNull Throwable t) { pb.setVisibility(View.GONE); }
        });
    }

    public void loadStaff(LinearLayout container, ProgressBar pb, TextView empty) {
        pb.setVisibility(View.VISIBLE);
        api.getStaff(session.getAuthHeader()).enqueue(new Callback<List<DashboardModels.Staff>>() {
            @Override public void onResponse(@NonNull Call<List<DashboardModels.Staff>> c,
                                             @NonNull Response<List<DashboardModels.Staff>> r) {
                pb.setVisibility(View.GONE);
                if (r.isSuccessful() && r.body() != null && !r.body().isEmpty()) {
                    for (DashboardModels.Staff s : r.body())
                        UiHelper.addCard(container, s.name, s.role + " | " + s.departmentName,
                                "Email: " + s.email, "STAFF", "#4f46e5");
                } else empty.setVisibility(View.VISIBLE);
            }
            @Override public void onFailure(@NonNull Call<List<DashboardModels.Staff>> c,
                                            @NonNull Throwable t) { pb.setVisibility(View.GONE); }
        });
    }

    public void loadFinanceSummary(LinearLayout container, ProgressBar pb, TextView empty,
                                   TextView stat1, TextView stat2) {
        pb.setVisibility(View.VISIBLE);
        api.getFinanceSummary(session.getAuthHeader()).enqueue(new Callback<DashboardModels.FinanceSummary>() {
            @Override public void onResponse(@NonNull Call<DashboardModels.FinanceSummary> c,
                                             @NonNull Response<DashboardModels.FinanceSummary> r) {
                pb.setVisibility(View.GONE);
                if (r.isSuccessful() && r.body() != null) {
                    DashboardModels.FinanceSummary s = r.body();
                    stat1.setText(String.format("KES %.0f", s.outstandingBalance));
                    stat2.setText(String.valueOf(s.invoiceCount));
                    container.removeAllViews();
                    if (s.recentInvoices != null) {
                        for (DashboardModels.Invoice inv : s.recentInvoices)
                            UiHelper.addCard(container, inv.description,
                                    "Amount: KES " + inv.amount + " | Due: " + inv.dueDate,
                                    null, inv.status.toUpperCase(), UiHelper.statusColor(inv.status));
                    }
                    if (container.getChildCount() == 0) empty.setVisibility(View.VISIBLE);
                }
            }
            @Override public void onFailure(@NonNull Call<DashboardModels.FinanceSummary> c,
                                            @NonNull Throwable t) { pb.setVisibility(View.GONE); }
        });
    }

    public void loadBorrowings(LinearLayout container, ProgressBar pb, TextView empty) {
        pb.setVisibility(View.VISIBLE);
        api.getBorrowings(session.getAuthHeader()).enqueue(new Callback<List<DashboardModels.Borrowing>>() {
            @Override public void onResponse(@NonNull Call<List<DashboardModels.Borrowing>> c,
                                             @NonNull Response<List<DashboardModels.Borrowing>> r) {
                pb.setVisibility(View.GONE);
                if (r.isSuccessful() && r.body() != null && !r.body().isEmpty()) {
                    for (DashboardModels.Borrowing b : r.body())
                        UiHelper.addCard(container, b.bookTitle,
                                "Borrowed: " + b.borrowDate + " | Due: " + b.dueDate,
                                null, b.status.toUpperCase(), UiHelper.statusColor(b.status));
                } else empty.setVisibility(View.VISIBLE);
            }
            @Override public void onFailure(@NonNull Call<List<DashboardModels.Borrowing>> c,
                                            @NonNull Throwable t) { pb.setVisibility(View.GONE); }
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public String getRole() { return session.getRole(); }

    private void openProfile() { startActivity(new Intent(this, ProfileActivity.class)); }

    private void logout() {
        api.logout(session.getAuthHeader()).enqueue(new Callback<DashboardModels.GenericResponse>() {
            @Override public void onResponse(@NonNull Call<DashboardModels.GenericResponse> c,
                                             @NonNull Response<DashboardModels.GenericResponse> r) {}
            @Override public void onFailure(@NonNull Call<DashboardModels.GenericResponse> c,
                                            @NonNull Throwable t) {}
        });
        session.clear();
        startActivity(new Intent(this, LoginActivity.class)
                .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK));
        finish();
    }

    private String roleLabel(String role) {
        switch (role.toLowerCase()) {
            case "parent":           return "PARENT PORTAL";
            case "registrar":        return "REGISTRAR";
            case "bursar":
            case "accountant":       return "BURSAR / FINANCE";
            case "hod":              return "HEAD OF DEPARTMENT";
            case "dean":             return "DEAN";
            case "principal":        return "PRINCIPAL";
            case "deputyprincipal":  return "DEPUTY PRINCIPAL";
            case "boardmember":      return "BOARD MEMBER";
            case "alumni":           return "ALUMNI";
            case "securityofficer":  return "SECURITY";
            case "librarian":        return "LIBRARIAN";
            case "hostelmanager":    return "HOSTEL MANAGER";
            case "transportmanager": return "TRANSPORT";
            case "hrofficer":        return "HR OFFICER";
            case "procurementofficer": return "PROCUREMENT";
            default:                 return role.toUpperCase();
        }
    }

    private String roleSub(String role) {
        switch (role.toLowerCase()) {
            case "parent":    return "Monitor your child's academic journey";
            case "registrar": return "Admissions, transcripts & student records";
            case "bursar":
            case "accountant": return "Finance, fees & billing management";
            case "hod":       return "Department staff, courses & performance";
            case "dean":      return "Faculty overview, research & programs";
            case "principal": return "School operations & strategic overview";
            case "alumni":    return "Stay connected with your institution";
            case "librarian": return "Books, borrowings & research repository";
            default:          return "Campus management portal";
        }
    }

    private String[] tabsForRole(String role) {
        switch (role.toLowerCase()) {
            case "parent":     return new String[]{"My Children", "Announcements", "Profile"};
            case "registrar":  return new String[]{"Students", "Admissions", "Announcements", "Profile"};
            case "bursar":
            case "accountant": return new String[]{"Finance Summary", "Invoices", "Announcements", "Profile"};
            case "hod":        return new String[]{"Overview", "Staff", "Courses", "Announcements", "Profile"};
            case "dean":       return new String[]{"Overview", "Programs", "Staff", "Announcements", "Profile"};
            case "principal":
            case "deputyprincipal": return new String[]{"Overview", "Students", "Staff", "Announcements", "Profile"};
            case "boardmember": return new String[]{"Summary", "Finance", "Announcements", "Profile"};
            case "alumni":     return new String[]{"My Profile", "Events", "Jobs", "Network", "Profile"};
            case "securityofficer": return new String[]{"Incidents", "Visitors", "Announcements", "Profile"};
            case "librarian":  return new String[]{"Books", "Borrowings", "Fines", "Announcements", "Profile"};
            default:           return new String[]{"Overview", "Announcements", "Profile"};
        }
    }
}
