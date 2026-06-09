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

public class AdminActivity extends AppCompatActivity {

    private TextView tvWelcome, tvAdminSchool;
    private Button btnProfile, btnLogout;
    private SharedPreferences sharedPreferences;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_admin);

        sharedPreferences = getSharedPreferences("SmartCampusPrefs", Context.MODE_PRIVATE);

        tvWelcome = findViewById(R.id.tv_admin_welcome);
        tvAdminSchool = findViewById(R.id.tv_admin_school);
        btnProfile = findViewById(R.id.btn_admin_profile);
        btnLogout = findViewById(R.id.btn_admin_logout);

        // Bind secure metadata
        String name = sharedPreferences.getString("user_name", "Academic System Administrator");
        String schoolId = sharedPreferences.getString("school_id", "Default Institutional Campus");

        tvWelcome.setText("Welcome Admin, " + name);
        
        if (TextUtils.isEmpty(schoolId) || "null".equalsIgnoreCase(schoolId)) {
            tvAdminSchool.setText("Status: Unbound Tenant Sandbox");
        } else {
            tvAdminSchool.setText("Institutional School Tenant: " + schoolId);
        }

        btnProfile.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(AdminActivity.this, ProfileActivity.class);
                startActivity(intent);
            }
        });

        btnLogout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                SharedPreferences.Editor editor = sharedPreferences.edit();
                editor.clear();
                editor.apply();

                Toast.makeText(AdminActivity.this, "Administrative Session Terminated safely.", Toast.LENGTH_SHORT).show();
                Intent intent = new Intent(AdminActivity.this, LoginActivity.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                finish();
            }
        });
    }
}
