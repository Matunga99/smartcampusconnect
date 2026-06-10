package com.smartcampus.connect;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.bumptech.glide.Glide;
import com.bumptech.glide.load.engine.DiskCacheStrategy;
import com.smartcampus.connect.api.ApiClient;
import com.smartcampus.connect.api.ApiService;
import com.smartcampus.connect.models.DashboardModels;
import com.smartcampus.connect.models.ProfileModels;
import com.smartcampus.connect.utils.SessionManager;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ProfileActivity extends AppCompatActivity {

    private de.hdodenhof.circleimageview.CircleImageView profileAvatar;
    private TextView tvHeaderName, tvHeaderRole, tvLegalName, tvStatus;
    private EditText etEmail, etPhone, etDob, etAddress, etBio;
    private Spinner spinnerGender;
    private Button btnSave, btnCancel, btnChangePassword;

    private SessionManager session;
    private ApiService api;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        session = new SessionManager(this);
        api = ApiClient.getClient(session.getBaseUrl());

        // Bind views
        profileAvatar     = findViewById(R.id.profile_avatar);
        tvHeaderName      = findViewById(R.id.profile_title_name);
        tvHeaderRole      = findViewById(R.id.profile_title_role);
        tvLegalName       = findViewById(R.id.tv_legal_name);
        tvStatus          = findViewById(R.id.profile_status);
        etEmail           = findViewById(R.id.et_profile_email);
        etPhone           = findViewById(R.id.et_profile_phone);
        spinnerGender     = findViewById(R.id.spinner_gender);
        etDob             = findViewById(R.id.et_profile_dob);
        etAddress         = findViewById(R.id.et_profile_address);
        etBio             = findViewById(R.id.et_profile_bio);
        btnSave           = findViewById(R.id.btn_save_profile);
        btnCancel         = findViewById(R.id.btn_cancel_profile);
        btnChangePassword = findViewById(R.id.btn_change_password);

        // Gender spinner
        List<String> genders = new ArrayList<>();
        genders.add("Male");
        genders.add("Female");
        genders.add("Other");
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this,
                android.R.layout.simple_spinner_item, genders);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerGender.setAdapter(adapter);

        btnCancel.setOnClickListener(v -> finish());
        btnSave.setOnClickListener(v -> saveProfileChanges());
        btnChangePassword.setOnClickListener(v -> showChangePasswordDialog());

        // Make avatar tappable to indicate future upload
        profileAvatar.setOnClickListener(v ->
                Toast.makeText(this, "Avatar upload coming soon", Toast.LENGTH_SHORT).show());

        fetchProfileData();
    }

    // ── Fetch & display profile ───────────────────────────────────────────────

    private void fetchProfileData() {
        if (TextUtils.isEmpty(session.getToken())) {
            Toast.makeText(this, "Session expired. Please log in again.", Toast.LENGTH_LONG).show();
            redirectToLogin();
            return;
        }

        api.getProfile(session.getAuthHeader()).enqueue(new Callback<ProfileModels.UserProfile>() {
            @Override
            public void onResponse(Call<ProfileModels.UserProfile> c, Response<ProfileModels.UserProfile> r) {
                if (r.isSuccessful() && r.body() != null) {
                    ProfileModels.UserProfile p = r.body();

                    tvHeaderName.setText(p.name != null ? p.name : "—");
                    tvLegalName.setText(p.name != null ? p.name : "—");
                    tvHeaderRole.setText(p.role != null ? p.role.toUpperCase() : "USER");
                    etEmail.setText(p.email != null ? p.email : "");

                    if (p.profile != null) {
                        etPhone.setText(p.profile.phone != null ? p.profile.phone : "");
                        etDob.setText(p.profile.dob != null ? p.profile.dob : "");
                        etAddress.setText(p.profile.address != null ? p.profile.address : "");
                        etBio.setText(p.profile.bio != null ? p.profile.bio : "");

                        // Gender spinner selection
                        if (!TextUtils.isEmpty(p.profile.gender)) {
                            if ("male".equalsIgnoreCase(p.profile.gender))
                                spinnerGender.setSelection(0);
                            else if ("female".equalsIgnoreCase(p.profile.gender))
                                spinnerGender.setSelection(1);
                            else
                                spinnerGender.setSelection(2);
                        }

                        // ── Load avatar with Glide ────────────────────────────
                        if (!TextUtils.isEmpty(p.profile.avatarUrl)) {
                            Glide.with(ProfileActivity.this)
                                    .load(p.profile.avatarUrl)
                                    .placeholder(android.R.drawable.sym_def_app_icon)
                                    .error(android.R.drawable.sym_def_app_icon)
                                    .diskCacheStrategy(DiskCacheStrategy.ALL)
                                    .circleCrop()
                                    .into(profileAvatar);
                        }
                    }
                } else {
                    Toast.makeText(ProfileActivity.this,
                            "Failed to load profile. Code: " + r.code(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ProfileModels.UserProfile> c, Throwable t) {
                Toast.makeText(ProfileActivity.this, "Network error loading profile.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    // ── Save profile changes ──────────────────────────────────────────────────

    private void saveProfileChanges() {
        String email   = etEmail.getText().toString().trim();
        String phone   = etPhone.getText().toString().trim();
        String gender  = spinnerGender.getSelectedItem().toString().toLowerCase();
        String dob     = etDob.getText().toString().trim();
        String address = etAddress.getText().toString().trim();
        String bio     = etBio.getText().toString().trim();

        if (TextUtils.isEmpty(email)) {
            Toast.makeText(this, "Email is required.", Toast.LENGTH_SHORT).show();
            return;
        }

        btnSave.setEnabled(false);
        btnSave.setText("Saving...");

        ProfileModels.ProfileDetails det = new ProfileModels.ProfileDetails();
        det.phone   = phone;
        det.gender  = gender;
        det.dob     = dob;
        det.address = address;
        det.bio     = bio;
        det.avatarUrl = "";
        det.coverUrl  = "";

        api.updateProfile(session.getAuthHeader(),
                new ProfileModels.UpdateProfileRequest(email, det))
                .enqueue(new Callback<ProfileModels.UpdateProfileResponse>() {
            @Override
            public void onResponse(Call<ProfileModels.UpdateProfileResponse> c,
                                   Response<ProfileModels.UpdateProfileResponse> r) {
                btnSave.setEnabled(true);
                btnSave.setText(R.string.btn_save_changes);
                if (r.isSuccessful()) {
                    tvStatus.setText("Profile updated successfully!");
                    tvStatus.setTextColor(0xFF10B981);
                    tvStatus.setVisibility(View.VISIBLE);
                    fetchProfileData();
                } else {
                    String err = "Update failed.";
                    try {
                        if (r.errorBody() != null) {
                            JSONObject j = new JSONObject(r.errorBody().string());
                            err = j.optString("error", err);
                        }
                    } catch (Exception ignored) {}
                    Toast.makeText(ProfileActivity.this, err, Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<ProfileModels.UpdateProfileResponse> c, Throwable t) {
                btnSave.setEnabled(true);
                btnSave.setText(R.string.btn_save_changes);
                Toast.makeText(ProfileActivity.this, "Network error saving profile.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    // ── Change password dialog ────────────────────────────────────────────────

    private void showChangePasswordDialog() {
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_change_password, null);
        EditText etCurrent = dialogView.findViewById(R.id.et_current_password);
        EditText etNew     = dialogView.findViewById(R.id.et_new_password);
        EditText etConfirm = dialogView.findViewById(R.id.et_confirm_password);

        new AlertDialog.Builder(this)
                .setTitle("Change Password")
                .setView(dialogView)
                .setPositiveButton("Update", (dialog, which) -> {
                    String current = etCurrent.getText().toString().trim();
                    String newPwd  = etNew.getText().toString().trim();
                    String confirm = etConfirm.getText().toString().trim();

                    if (current.isEmpty() || newPwd.isEmpty()) {
                        Toast.makeText(this, "All fields are required.", Toast.LENGTH_SHORT).show();
                        return;
                    }
                    if (!newPwd.equals(confirm)) {
                        Toast.makeText(this, "Passwords do not match.", Toast.LENGTH_SHORT).show();
                        return;
                    }
                    if (newPwd.length() < 6) {
                        Toast.makeText(this, "Password must be at least 6 characters.", Toast.LENGTH_SHORT).show();
                        return;
                    }
                    submitPasswordChange(current, newPwd);
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void submitPasswordChange(String current, String newPwd) {
        DashboardModels.ChangePasswordRequest req =
                new DashboardModels.ChangePasswordRequest(current, newPwd);

        api.changePassword(session.getAuthHeader(), req)
                .enqueue(new Callback<DashboardModels.GenericResponse>() {
            @Override
            public void onResponse(Call<DashboardModels.GenericResponse> c,
                                   Response<DashboardModels.GenericResponse> r) {
                if (r.isSuccessful()) {
                    Toast.makeText(ProfileActivity.this,
                            "Password changed successfully!", Toast.LENGTH_SHORT).show();
                    // Force re-login for security
                    new AlertDialog.Builder(ProfileActivity.this)
                            .setTitle("Password Changed")
                            .setMessage("Please log in again with your new password.")
                            .setPositiveButton("OK", (d, w) -> redirectToLogin())
                            .setCancelable(false)
                            .show();
                } else {
                    String err = "Failed to change password.";
                    try {
                        if (r.errorBody() != null) {
                            JSONObject j = new JSONObject(r.errorBody().string());
                            err = j.optString("error", err);
                        }
                    } catch (Exception ignored) {}
                    Toast.makeText(ProfileActivity.this, err, Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<DashboardModels.GenericResponse> c, Throwable t) {
                Toast.makeText(ProfileActivity.this, "Network error.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void redirectToLogin() {
        session.clear();
        startActivity(new Intent(this, LoginActivity.class)
                .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK));
        finish();
    }
}
