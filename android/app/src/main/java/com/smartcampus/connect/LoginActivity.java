package com.smartcampus.connect;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.smartcampus.connect.api.ApiClient;
import com.smartcampus.connect.api.ApiService;
import com.smartcampus.connect.models.AuthModels;

import org.json.JSONObject;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    private EditText etApiUrl, etIdentity, etPassword;
    private Button btnLogin;
    private TextView tvError;
    private SharedPreferences sharedPreferences;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        // Bind shared preferences local sandbox storage
        sharedPreferences = getSharedPreferences("SmartCampusPrefs", Context.MODE_PRIVATE);

        // Initialize UI Elements
        etApiUrl = findViewById(R.id.et_api_url);
        etIdentity = findViewById(R.id.et_identity);
        etPassword = findViewById(R.id.et_password);
        btnLogin = findViewById(R.id.btn_login);
        tvError = findViewById(R.id.tv_login_error);

        // Quick active session checker for auto-login bypass support
        String savedToken = sharedPreferences.getString("auth_token", null);
        String savedRole = sharedPreferences.getString("user_role", null);
        if (!TextUtils.isEmpty(savedToken) && !TextUtils.isEmpty(savedRole)) {
            navigateToDashboard(savedRole);
            finish();
            return;
        }

        // Action trigger login action
        btnLogin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                performLogin();
            }
        });
    }

    private void performLogin() {
        String baseUrl = etApiUrl.getText().toString().trim();
        String identity = etIdentity.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        if (TextUtils.isEmpty(baseUrl)) {
            showError("API Server Base URL is critical.");
            return;
        }
        if (TextUtils.isEmpty(identity)) {
            showError("Please provide your email address or admission registration code.");
            return;
        }
        if (TextUtils.isEmpty(password)) {
            showError("Security Password cannot be empty.");
            return;
        }

        tvError.setVisibility(View.GONE);
        btnLogin.setEnabled(false);
        btnLogin.setText("Authorizing Portal...");

        // Invoke ApiClient dynamically configured to the requested Server URL
        ApiService apiService = ApiClient.getClient(baseUrl);
        AuthModels.LoginRequest requestPayload = new AuthModels.LoginRequest(identity, password);

        apiService.login(requestPayload).enqueue(new Callback<AuthModels.LoginResponse>() {
            @Override
            public void onResponse(Call<AuthModels.LoginResponse> call, Response<AuthModels.LoginResponse> response) {
                btnLogin.setEnabled(true);
                btnLogin.setText(R.string.btn_login);

                if (response.isSuccessful() && response.body() != null) {
                    AuthModels.LoginResponse loginResponse = response.body();

                    // Persist credentials in private SharedPreferences securely
                    SharedPreferences.Editor editor = sharedPreferences.edit();
                    editor.putString("api_base_url", baseUrl);
                    editor.putString("auth_token", loginResponse.token);
                    editor.putString("user_id", loginResponse.user.id);
                    editor.putString("user_name", loginResponse.user.name);
                    editor.putString("user_email", loginResponse.user.email);
                    editor.putString("user_role", loginResponse.user.role);
                    editor.putString("school_id", loginResponse.user.schoolId);
                    editor.apply();

                    Toast.makeText(LoginActivity.this, "Session Authorized successfully!", Toast.LENGTH_SHORT).show();
                    navigateToDashboard(loginResponse.user.role);
                    finish();
                } else {
                    try {
                        String errMsg = "Invalid credential authorization matching credentials.";
                        if (response.errorBody() != null) {
                            JSONObject jsonObject = new JSONObject(response.errorBody().string());
                            if (jsonObject.has("error")) {
                                errMsg = jsonObject.getString("error");
                            }
                        }
                        showError(errMsg);
                    } catch (Exception e) {
                        showError("Failed to authenticate session: Code: " + response.code());
                    }
                }
            }

            @Override
            public void onFailure(Call<AuthModels.LoginResponse> call, Throwable t) {
                btnLogin.setEnabled(true);
                btnLogin.setText(R.string.btn_login);
                showError("Network Handshake Failed: Please confirm Server is Online (port 3000 mapping).");
            }
        });
    }

    private void showError(String message) {
        tvError.setText(message);
        tvError.setVisibility(View.VISIBLE);
    }

    /**
     * Decentralized navigation index map switcher routing. It maps backend roles to 
     * specific Native Activities as per exact requirement guidelines.
     */
    private void navigateToDashboard(String role) {
        Intent intent;
        if ("superadmin".equalsIgnoreCase(role)) {
            intent = new Intent(this, SuperAdminActivity.class);
        } else if ("admin".equalsIgnoreCase(role)) {
            intent = new Intent(this, AdminActivity.class);
        } else if ("staff".equalsIgnoreCase(role) || "lecturer".equalsIgnoreCase(role)) {
            intent = new Intent(this, LecturerActivity.class);
        } else if ("student".equalsIgnoreCase(role)) {
            intent = new Intent(this, StudentActivity.class);
        } else {
            // Default elegant fallback route container
            intent = new Intent(this, StudentActivity.class);
        }
        startActivity(intent);
    }
}
