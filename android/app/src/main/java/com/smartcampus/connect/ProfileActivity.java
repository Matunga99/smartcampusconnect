package com.smartcampus.connect;

import android.content.Context;
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

import androidx.appcompat.app.AppCompatActivity;

import com.smartcampus.connect.api.ApiClient;
import com.smartcampus.connect.api.ApiService;
import com.smartcampus.connect.models.ProfileModels;

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
    private Button btnSave, btnCancel;

    private SharedPreferences sharedPreferences;
    private String baseUrl, token;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        // Bind SharedPreferences secure config
        sharedPreferences = getSharedPreferences("SmartCampusPrefs", Context.MODE_PRIVATE);
        baseUrl = sharedPreferences.getString("api_base_url", "https://ais-dev-kgj4efa3zezeyu4wyibiv3-72418098555.europe-west2.run.app");
        token = sharedPreferences.getString("auth_token", "");

        // Find views
        profileAvatar = findViewById(R.id.profile_avatar);
        tvHeaderName = findViewById(R.id.profile_title_name);
        tvHeaderRole = findViewById(R.id.profile_title_role);
        tvLegalName = findViewById(R.id.tv_legal_name);
        tvStatus = findViewById(R.id.profile_status);

        etEmail = findViewById(R.id.et_profile_email);
        etPhone = findViewById(R.id.et_profile_phone);
        spinnerGender = findViewById(R.id.spinner_gender);
        etDob = findViewById(R.id.et_profile_dob);
        etAddress = findViewById(R.id.et_profile_address);
        etBio = findViewById(R.id.et_profile_bio);

        btnSave = findViewById(R.id.btn_save_profile);
        btnCancel = findViewById(R.id.btn_cancel_profile);

        // Fill Gender spinner matching Web form
        List<String> genders = new ArrayList<>();
        genders.add("Male");
        genders.add("Female");
        genders.add("Other");
        ArrayAdapter<String> dataAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, genders);
        dataAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerGender.setAdapter(dataAdapter);

        // Terminate button intent
        btnCancel.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish(); // Dismiss Profile page activity frame back to Caller Dashboard Activity
            }
        });

        // Trigger dynamic data fetch using token key
        fetchProfileData();

        // Save modification trigger
        btnSave.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                saveProfileChanges();
            }
        });
    }

    private void fetchProfileData() {
        if (TextUtils.isEmpty(token)) {
            Toast.makeText(this, "Session token missing. Please sign back in.", Toast.LENGTH_LONG).show();
            finish();
            return;
        }

        ApiService apiService = ApiClient.getClient(baseUrl);
        String authHeader = "Bearer " + token;

        apiService.getProfile(authHeader).enqueue(new Callback<ProfileModels.UserProfile>() {
            @Override
            public void onResponse(Call<ProfileModels.UserProfile> call, Response<ProfileModels.UserProfile> response) {
                if (response.isSuccessful() && response.body() != null) {
                    ProfileModels.UserProfile userProfile = response.body();

                    // Display metadata fields in header section
                    tvHeaderName.setText(userProfile.name);
                    tvLegalName.setText(userProfile.name);
                    tvHeaderRole.setText(userProfile.role.toUpperCase());

                    etEmail.setText(userProfile.email);

                    if (userProfile.profile != null) {
                        etPhone.setText(userProfile.profile.phone);
                        etDob.setText(userProfile.profile.dob);
                        etAddress.setText(userProfile.profile.address);
                        etBio.setText(userProfile.profile.bio);

                        // Match spinner selection of Gender enum details
                        String genderValue = userProfile.profile.gender;
                        if (!TextUtils.isEmpty(genderValue)) {
                            if ("male".equalsIgnoreCase(genderValue)) {
                                spinnerGender.setSelection(0);
                            } else if ("female".equalsIgnoreCase(genderValue)) {
                                spinnerGender.setSelection(1);
                            } else {
                                spinnerGender.setSelection(2);
                            }
                        }
                    }
                } else {
                    Toast.makeText(ProfileActivity.this, "Failed to load session profile data. Code: " + response.code(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ProfileModels.UserProfile> call, Throwable t) {
                Toast.makeText(ProfileActivity.this, "Network error fetching profile details.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void saveProfileChanges() {
        String updatedEmail = etEmail.getText().toString().trim();
        String updatedPhone = etPhone.getText().toString().trim();
        String updatedGender = spinnerGender.getSelectedItem().toString().toLowerCase();
        String updatedDob = etDob.getText().toString().trim();
        String updatedAddress = etAddress.getText().toString().trim();
        String updatedBio = etBio.getText().toString().trim();

        if (TextUtils.isEmpty(updatedEmail)) {
            Toast.makeText(this, "Identity email is required field.", Toast.LENGTH_SHORT).show();
            return;
        }

        btnSave.setEnabled(false);
        btnSave.setText("Committing updates to database...");

        // Design nested structures payload
        ProfileModels.ProfileDetails det = new ProfileModels.ProfileDetails();
        det.phone = updatedPhone;
        det.gender = updatedGender;
        det.dob = updatedDob;
        det.address = updatedAddress;
        det.bio = updatedBio;
        det.avatarUrl = ""; 
        det.coverUrl = "";

        ProfileModels.UpdateProfileRequest requestPayload = new ProfileModels.UpdateProfileRequest(updatedEmail, det);

        ApiService apiService = ApiClient.getClient(baseUrl);
        String authHeader = "Bearer " + token;

        apiService.updateProfile(authHeader, requestPayload).enqueue(new Callback<ProfileModels.UpdateProfileResponse>() {
            @Override
            public void onResponse(Call<ProfileModels.UpdateProfileResponse> call, Response<ProfileModels.UpdateProfileResponse> response) {
                btnSave.setEnabled(true);
                btnSave.setText(R.string.btn_save_changes);

                if (response.isSuccessful() && response.body() != null) {
                    Toast.makeText(ProfileActivity.this, "Profile updated successfully!", Toast.LENGTH_SHORT).show();
                    tvStatus.setText("SUCCESSFULLY MUTATED USER DATABASE RECORD!");
                    tvStatus.setVisibility(View.VISIBLE);
                    
                    // Fetch latest profile state to verify correct binding layout
                    fetchProfileData();
                } else {
                    try {
                        String errMsg = "Validation Error modifying database values.";
                        if (response.errorBody() != null) {
                            JSONObject jsonObject = new JSONObject(response.errorBody().string());
                            if (jsonObject.has("error")) {
                                errMsg = jsonObject.getString("error");
                            }
                        }
                        Toast.makeText(ProfileActivity.this, errMsg, Toast.LENGTH_LONG).show();
                    } catch (Exception e) {
                        Toast.makeText(ProfileActivity.this, "Update Failed, HTTP Code: " + response.code(), Toast.LENGTH_SHORT).show();
                    }
                }
            }

            @Override
            public void onFailure(Call<ProfileModels.UpdateProfileResponse> call, Throwable t) {
                btnSave.setEnabled(true);
                btnSave.setText(R.string.btn_save_changes);
                Toast.makeText(ProfileActivity.this, "Network transaction failure during saving profile.", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
