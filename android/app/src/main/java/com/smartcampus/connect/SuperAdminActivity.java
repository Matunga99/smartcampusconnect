package com.smartcampus.connect;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

public class SuperAdminActivity extends AppCompatActivity {

    private TextView tvWelcome, tvTenantDesc;
    private Button btnProfile, btnLogout;
    private SharedPreferences sharedPreferences;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_super_admin);

        sharedPreferences = getSharedPreferences("SmartCampusPrefs", Context.MODE_PRIVATE);

        tvWelcome = findViewById(R.id.tv_admin_welcome);
        tvTenantDesc = findViewById(R.id.tv_tenant_desc);
        btnProfile = findViewById(R.id.btn_superadmin_profile);
        btnLogout = findViewById(R.id.btn_superadmin_logout);

        // Bind user details
        String name = sharedPreferences.getString("user_name", "Super Administrator");
        String schoolId = sharedPreferences.getString("school_id", null);

        tvWelcome.setText("Welcome, " + name);

        if (TextUtils.isEmpty(schoolId)) {
            tvTenantDesc.setText("Global Multi-Institution Mode - No primary School restriction (Universal Scope).");
        } else {
            tvTenantDesc.setText("Bounded to Super-Institution Tenant ID: " + schoolId);
        }

        // Navigate directly to Profile console page
        btnProfile.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(SuperAdminActivity.this, ProfileActivity.class);
                startActivity(intent);
            }
        });

        // Safe Session Termination and clear keys
        btnLogout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                SharedPreferences.Editor editor = sharedPreferences.edit();
                editor.clear();
                editor.apply();

                Toast.makeText(SuperAdminActivity.this, "Session Terminated. Credentials purged safely.", Toast.LENGTH_SHORT).show();
                Intent intent = new Intent(SuperAdminActivity.this, LoginActivity.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                finish();
            }
        });
    }
}
