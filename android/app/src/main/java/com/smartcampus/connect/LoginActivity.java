package com.smartcampus.connect;

import android.content.Intent;
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
import com.smartcampus.connect.utils.SessionManager;

import org.json.JSONObject;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * Login gateway — authenticates users and routes them to the correct dashboard.
 * Uses SessionManager for all session persistence so SplashActivity auto-login works.
 */
public class LoginActivity extends AppCompatActivity {

    private EditText etApiUrl, etIdentity, etPassword;
    private Button btnLogin;
    private TextView tvError;
    private SessionManager session;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        session = new SessionManager(this);

        etApiUrl   = findViewById(R.id.et_api_url);
        etIdentity = findViewById(R.id.et_identity);
        etPassword = findViewById(R.id.et_password);
        btnLogin   = findViewById(R.id.btn_login);
        tvError    = findViewById(R.id.tv_login_error);

        // Pre-fill saved server URL
        String savedUrl = session.getBaseUrl();
        if (!TextUtils.isEmpty(savedUrl)) etApiUrl.setText(savedUrl);

        // Auto-login if valid session exists (SplashActivity also does this,
        // but guard here in case LoginActivity is launched directly)
        if (session.isLoggedIn()) {
            navigateToDashboard(session.getRole());
            finish();
            return;
        }

        btnLogin.setOnClickListener(v -> performLogin());
    }

    private void performLogin() {
        String baseUrl  = etApiUrl.getText().toString().trim();
        String identity = etIdentity.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        if (TextUtils.isEmpty(baseUrl)) { showError("API Server URL is required."); return; }
        if (TextUtils.isEmpty(identity)) { showError("Email or registration number required."); return; }
        if (TextUtils.isEmpty(password)) { showError("Password cannot be empty."); return; }

        tvError.setVisibility(View.GONE);
        btnLogin.setEnabled(false);
        btnLogin.setText("Authorizing...");

        ApiService api = ApiClient.getClient(baseUrl);
        api.login(new AuthModels.LoginRequest(identity, password))
                .enqueue(new Callback<AuthModels.LoginResponse>() {
            @Override
            public void onResponse(Call<AuthModels.LoginResponse> c,
                                   Response<AuthModels.LoginResponse> r) {
                btnLogin.setEnabled(true);
                btnLogin.setText(R.string.btn_login);

                if (r.isSuccessful() && r.body() != null) {
                    AuthModels.LoginResponse resp = r.body();
                    AuthModels.User u = resp.user;

                    // Save everything via SessionManager — SplashActivity will read these
                    session.save(
                            resp.token,
                            u.id,
                            u.name,
                            u.email,
                            u.role,
                            u.schoolId,
                            u.regNumber,
                            baseUrl
                    );

                    Toast.makeText(LoginActivity.this, "Welcome, " + u.name, Toast.LENGTH_SHORT).show();
                    navigateToDashboard(u.role);
                    finish();
                } else {
                    String err = "Invalid credentials.";
                    try {
                        if (r.errorBody() != null) {
                            JSONObject j = new JSONObject(r.errorBody().string());
                            err = j.optString("error", err);
                        }
                    } catch (Exception ignored) {}
                    showError(err);
                }
            }

            @Override
            public void onFailure(Call<AuthModels.LoginResponse> c, Throwable t) {
                btnLogin.setEnabled(true);
                btnLogin.setText(R.string.btn_login);
                showError("Connection failed. Is the server running at " + baseUrl + "?");
            }
        });
    }

    private void showError(String msg) {
        tvError.setText(msg);
        tvError.setVisibility(View.VISIBLE);
    }

    private void navigateToDashboard(String role) {
        Intent intent;
        switch (role == null ? "" : role.toLowerCase()) {
            case "superadmin":        intent = new Intent(this, SuperAdminActivity.class); break;
            case "admin":             intent = new Intent(this, AdminActivity.class); break;
            case "staff":
            case "lecturer":          intent = new Intent(this, LecturerActivity.class); break;
            case "student":           intent = new Intent(this, StudentActivity.class); break;
            default:                  intent = new Intent(this, GenericRoleDashboard.class); break;
        }
        startActivity(intent);
    }
}
