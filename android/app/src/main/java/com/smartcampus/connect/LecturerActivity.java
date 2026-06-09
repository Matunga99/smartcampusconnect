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

public class LecturerActivity extends AppCompatActivity {

    private TextView tvWelcome, tvLecturerSchool;
    private Button btnProfile, btnLogout;
    private SharedPreferences sharedPreferences;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_lecturer);

        sharedPreferences = getSharedPreferences("SmartCampusPrefs", Context.MODE_PRIVATE);

        tvWelcome = findViewById(R.id.tv_lecturer_welcome);
        tvLecturerSchool = findViewById(R.id.tv_lecturer_school);
        btnProfile = findViewById(R.id.btn_lecturer_profile);
        btnLogout = findViewById(R.id.btn_lecturer_logout);

        // Bind lecturer values
        String name = sharedPreferences.getString("user_name", "Academic Staff Core");
        String schoolId = sharedPreferences.getString("school_id", "Axiom Learning Center");

        tvWelcome.setText("Welcome Professor, " + name);

        if (TextUtils.isEmpty(schoolId) || "null".equalsIgnoreCase(schoolId)) {
            tvLecturerSchool.setText("Status: Unbound Tenant Sandbox");
        } else {
            tvLecturerSchool.setText("Staff Multi-Tenant Domain ID: " + schoolId);
        }

        btnProfile.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(LecturerActivity.this, ProfileActivity.class);
                startActivity(intent);
            }
        });

        btnLogout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                SharedPreferences.Editor editor = sharedPreferences.edit();
                editor.clear();
                editor.apply();

                Toast.makeText(LecturerActivity.this, "Staff Workspace signed-out safely.", Toast.LENGTH_SHORT).show();
                Intent intent = new Intent(LecturerActivity.this, LoginActivity.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                finish();
            }
        });
    }
}
