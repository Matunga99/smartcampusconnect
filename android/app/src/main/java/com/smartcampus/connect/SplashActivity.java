package com.smartcampus.connect;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;

import androidx.appcompat.app.AppCompatActivity;

import com.smartcampus.connect.utils.SessionManager;

/**
 * Splash screen shown for 1.2s on app launch.
 * Checks existing session — routes to dashboard if logged in, login screen otherwise.
 */
public class SplashActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // No setContentView — uses the windowBackground from Theme.Splash

        new Handler().postDelayed(() -> {
            SessionManager session = new SessionManager(this);
            Intent intent;
            if (session.isLoggedIn()) {
                // Route directly to the right dashboard
                String role = session.getRole();
                intent = roleToIntent(role);
            } else {
                intent = new Intent(this, LoginActivity.class);
            }
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            finish();
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
        }, 1200);
    }

    private Intent roleToIntent(String role) {
        switch (role.toLowerCase()) {
            case "superadmin":   return new Intent(this, SuperAdminActivity.class);
            case "admin":        return new Intent(this, AdminActivity.class);
            case "staff":
            case "lecturer":     return new Intent(this, LecturerActivity.class);
            case "student":      return new Intent(this, StudentActivity.class);
            default:             return new Intent(this, GenericRoleDashboard.class);
        }
    }
}
