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

public class StudentActivity extends AppCompatActivity {

    private TextView tvWelcome, tvStudentSchool;
    private Button btnProfile, btnLogout;
    private SharedPreferences sharedPreferences;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_student);

        sharedPreferences = getSharedPreferences("SmartCampusPrefs", Context.MODE_PRIVATE);

        tvWelcome = findViewById(R.id.tv_student_welcome);
        tvStudentSchool = findViewById(R.id.tv_student_school);
        btnProfile = findViewById(R.id.btn_student_profile);
        btnLogout = findViewById(R.id.btn_student_logout);

        // Bind scholarly values
        String name = sharedPreferences.getString("user_name", "Academic Scholar Student");
        String schoolId = sharedPreferences.getString("school_id", "State University Central Campus");

        tvWelcome.setText("Welcome Scholar, " + name);

        if (TextUtils.isEmpty(schoolId) || "null".equalsIgnoreCase(schoolId)) {
            tvStudentSchool.setText("Status: Independent Tenant Scholar");
        } else {
            tvStudentSchool.setText("Scholar Affiliated Academy ID: " + schoolId);
        }

        btnProfile.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(StudentActivity.this, ProfileActivity.class);
                startActivity(intent);
            }
        });

        btnLogout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                SharedPreferences.Editor editor = sharedPreferences.edit();
                editor.clear();
                editor.apply();

                Toast.makeText(StudentActivity.this, "Student account signed-out safely.", Toast.LENGTH_SHORT).show();
                Intent intent = new Intent(StudentActivity.this, LoginActivity.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                finish();
            }
        });
    }
}
