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

import com.smartcampus.connect.GenericRoleDashboard;
import com.smartcampus.connect.R;
import com.smartcampus.connect.utils.UiHelper;

public class GenericRoleFragment extends Fragment {

    private static final String ARG_TAB  = "tab";
    private static final String ARG_ROLE = "role";

    public static GenericRoleFragment newInstance(int tab, String role) {
        GenericRoleFragment f = new GenericRoleFragment();
        Bundle args = new Bundle();
        args.putInt(ARG_TAB, tab);
        args.putString(ARG_ROLE, role);
        f.setArguments(args);
        return f;
    }

    @Nullable @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_dashboard_cards, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        int tab  = getArguments() != null ? getArguments().getInt(ARG_TAB, 0) : 0;
        String role = getArguments() != null ? getArguments().getString(ARG_ROLE, "") : "";

        LinearLayout container = view.findViewById(R.id.ll_items_container);
        ProgressBar  pb        = view.findViewById(R.id.progress_bar);
        TextView     empty     = view.findViewById(R.id.tv_empty);
        TextView     stat1     = view.findViewById(R.id.tv_stat1_value);
        TextView     stat2     = view.findViewById(R.id.tv_stat2_value);
        TextView     stat1L    = view.findViewById(R.id.tv_stat1_label);
        TextView     stat2L    = view.findViewById(R.id.tv_stat2_label);
        TextView     secTitle  = view.findViewById(R.id.tv_section_title);

        if (!(requireActivity() instanceof GenericRoleDashboard)) return;
        GenericRoleDashboard host = (GenericRoleDashboard) requireActivity();

        switch (role.toLowerCase()) {

            // ── Parent ────────────────────────────────────────────────────────
            case "parent":
                if (tab == 0) { secTitle.setText("Your Children"); host.loadStudents(container, pb, empty); }
                else if (tab == 1) { secTitle.setText("Announcements"); host.loadAnnouncements(container, pb, empty); }
                else if (tab == 2) host.openProfile();
                break;

            // ── Registrar ─────────────────────────────────────────────────────
            case "registrar":
                if (tab == 0) { secTitle.setText("Students Directory"); host.loadStudents(container, pb, empty); }
                else if (tab == 1) { secTitle.setText("Admissions"); UiHelper.addCard(container, "Admissions Console", "View and process applications on the web portal", null, "WEB", "#4f46e5"); }
                else if (tab == 2) { secTitle.setText("Announcements"); host.loadAnnouncements(container, pb, empty); }
                else if (tab == 3) host.openProfile();
                break;

            // ── Bursar / Accountant ───────────────────────────────────────────
            case "bursar":
            case "accountant":
                if (tab == 0) {
                    secTitle.setText("Finance Overview");
                    stat1L.setText("Outstanding (KES)");
                    stat2L.setText("Invoices");
                    host.loadFinanceSummary(container, pb, empty, stat1, stat2);
                } else if (tab == 1) { secTitle.setText("Recent Invoices"); host.loadFinanceSummary(container, pb, empty, stat1, stat2); }
                else if (tab == 2) { secTitle.setText("Announcements"); host.loadAnnouncements(container, pb, empty); }
                else if (tab == 3) host.openProfile();
                break;

            // ── HOD ───────────────────────────────────────────────────────────
            case "hod":
                if (tab == 0) { secTitle.setText("Department Overview"); host.loadAnnouncements(container, pb, empty); }
                else if (tab == 1) { secTitle.setText("Department Staff"); host.loadStaff(container, pb, empty); }
                else if (tab == 2) { secTitle.setText("Courses / Units"); UiHelper.addCard(container, "Course Management", "Manage units via the web admin portal", null, "WEB", "#4f46e5"); }
                else if (tab == 3) { secTitle.setText("Announcements"); host.loadAnnouncements(container, pb, empty); }
                else if (tab == 4) host.openProfile();
                break;

            // ── Dean ──────────────────────────────────────────────────────────
            case "dean":
                if (tab == 0) { secTitle.setText("Faculty Overview"); host.loadAnnouncements(container, pb, empty); }
                else if (tab == 1) { secTitle.setText("Programs"); UiHelper.addCard(container, "Program Registry", "View and configure academic programs via web portal", null, "WEB", "#4f46e5"); }
                else if (tab == 2) { secTitle.setText("Faculty Staff"); host.loadStaff(container, pb, empty); }
                else if (tab == 3) { secTitle.setText("Announcements"); host.loadAnnouncements(container, pb, empty); }
                else if (tab == 4) host.openProfile();
                break;

            // ── Principal / Deputy ────────────────────────────────────────────
            case "principal":
            case "deputyprincipal":
                if (tab == 0) {
                    secTitle.setText("School Overview");
                    stat1L.setText("Students");
                    stat2L.setText("Staff");
                    host.loadStudents(container, pb, empty);
                } else if (tab == 1) { secTitle.setText("Students"); host.loadStudents(container, pb, empty); }
                else if (tab == 2) { secTitle.setText("Staff"); host.loadStaff(container, pb, empty); }
                else if (tab == 3) { secTitle.setText("Announcements"); host.loadAnnouncements(container, pb, empty); }
                else if (tab == 4) host.openProfile();
                break;

            // ── Board Member ──────────────────────────────────────────────────
            case "boardmember":
                if (tab == 0) {
                    secTitle.setText("Institutional Summary");
                    stat1L.setText("Outstanding (KES)");
                    stat2L.setText("Invoices");
                    host.loadFinanceSummary(container, pb, empty, stat1, stat2);
                } else if (tab == 1) { secTitle.setText("Finance Details"); host.loadFinanceSummary(container, pb, empty, stat1, stat2); }
                else if (tab == 2) { secTitle.setText("Announcements"); host.loadAnnouncements(container, pb, empty); }
                else if (tab == 3) host.openProfile();
                break;

            // ── Alumni ────────────────────────────────────────────────────────
            case "alumni":
                if (tab == 0) { secTitle.setText("My Alumni Profile"); UiHelper.addCard(container, "Alumni Network", "Access full alumni features on the web portal", null, "WEB", "#10b981"); }
                else if (tab == 1) { secTitle.setText("Events"); host.loadAnnouncements(container, pb, empty); }
                else if (tab == 2) { secTitle.setText("Job Board"); UiHelper.addCard(container, "Job Opportunities", "Browse jobs posted by alumni and partners", null, "JOBS", "#f59e0b"); }
                else if (tab == 3) { secTitle.setText("Network"); host.loadStaff(container, pb, empty); }
                else if (tab == 4) host.openProfile();
                break;

            // ── Security Officer ──────────────────────────────────────────────
            case "securityofficer":
                if (tab == 0) { secTitle.setText("Incidents"); UiHelper.addCard(container, "Security Console", "View and log incidents on the web portal", null, "SECURITY", "#ef4444"); }
                else if (tab == 1) { secTitle.setText("Visitor Logs"); UiHelper.addCard(container, "Visitor Management", "Manage visitor check-in/out on the web portal", null, "VISITORS", "#f59e0b"); }
                else if (tab == 2) { secTitle.setText("Announcements"); host.loadAnnouncements(container, pb, empty); }
                else if (tab == 3) host.openProfile();
                break;

            // ── Librarian ─────────────────────────────────────────────────────
            case "librarian":
                if (tab == 0) { secTitle.setText("Book Catalogue"); host.loadBorrowings(container, pb, empty); }
                else if (tab == 1) { secTitle.setText("Active Borrowings"); host.loadBorrowings(container, pb, empty); }
                else if (tab == 2) { secTitle.setText("Fines"); UiHelper.addCard(container, "Library Fines", "Manage fines via the web portal", null, "FINES", "#ef4444"); }
                else if (tab == 3) { secTitle.setText("Announcements"); host.loadAnnouncements(container, pb, empty); }
                else if (tab == 4) host.openProfile();
                break;

            // ── Default fallback ──────────────────────────────────────────────
            default:
                if (tab == 0) { secTitle.setText("Overview"); host.loadAnnouncements(container, pb, empty); }
                else if (tab == 1) { secTitle.setText("Announcements"); host.loadAnnouncements(container, pb, empty); }
                else host.openProfile();
        }
    }

    public void openProfile() {
        if (requireActivity() instanceof GenericRoleDashboard)
            ((GenericRoleDashboard) requireActivity()).openProfile();
    }
}
