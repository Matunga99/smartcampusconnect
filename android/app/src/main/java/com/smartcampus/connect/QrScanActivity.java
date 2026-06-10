package com.smartcampus.connect;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.camera.core.Camera;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageAnalysis;
import androidx.camera.core.Preview;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.google.common.util.concurrent.ListenableFuture;
import com.smartcampus.connect.api.ApiClient;
import com.smartcampus.connect.api.ApiService;
import com.smartcampus.connect.models.DashboardModels;
import com.smartcampus.connect.utils.QrCodeAnalyzer;
import com.smartcampus.connect.utils.SessionManager;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * QR Code Scanner Activity for attendance.
 * Students scan the QR displayed on the lecturer's screen to mark attendance.
 *
 * Uses CameraX + ML Kit Barcode Scanner.
 * Falls back to manual token entry if camera unavailable.
 */
public class QrScanActivity extends AppCompatActivity {

    private static final int CAMERA_PERMISSION_CODE = 101;
    private static final String EXTRA_SESSION_ID = "session_id";

    private SessionManager session;
    private ApiService api;
    private ExecutorService cameraExecutor;

    private PreviewView previewView;
    private TextView tvStatus;
    private Button btnManualEntry;
    private boolean scanned = false;

    public static Intent createIntent(android.content.Context ctx, String sessionId) {
        Intent i = new Intent(ctx, QrScanActivity.class);
        i.putExtra(EXTRA_SESSION_ID, sessionId);
        return i;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_qr_scan);

        session = new SessionManager(this);
        api = ApiClient.getClient(session.getBaseUrl());
        cameraExecutor = Executors.newSingleThreadExecutor();

        previewView  = findViewById(R.id.preview_view);
        tvStatus     = findViewById(R.id.tv_qr_status);
        btnManualEntry = findViewById(R.id.btn_manual_entry);

        tvStatus.setText("Position the QR code within the frame");

        btnManualEntry.setOnClickListener(v -> showManualEntryDialog());

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
                == PackageManager.PERMISSION_GRANTED) {
            startCamera();
        } else {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION_CODE);
        }
    }

    private void startCamera() {
        ListenableFuture<ProcessCameraProvider> future =
                ProcessCameraProvider.getInstance(this);

        future.addListener(() -> {
            try {
                ProcessCameraProvider provider = future.get();

                Preview preview = new Preview.Builder().build();
                preview.setSurfaceProvider(previewView.getSurfaceProvider());

                ImageAnalysis imageAnalysis = new ImageAnalysis.Builder()
                        .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                        .build();

                imageAnalysis.setAnalyzer(cameraExecutor, new QrCodeAnalyzer(qrValue -> {
                    if (!scanned) {
                        scanned = true;
                        runOnUiThread(() -> processQrValue(qrValue));
                    }
                }));

                provider.unbindAll();
                provider.bindToLifecycle(this,
                        CameraSelector.DEFAULT_BACK_CAMERA,
                        preview, imageAnalysis);

            } catch (ExecutionException | InterruptedException e) {
                runOnUiThread(() -> Toast.makeText(this,
                        "Camera error: " + e.getMessage(), Toast.LENGTH_LONG).show());
            }
        }, ContextCompat.getMainExecutor(this));
    }

    private void processQrValue(String value) {
        tvStatus.setText("QR detected — verifying...");
        // Expected format: {"sessionId":"...","qrToken":"..."}
        try {
            org.json.JSONObject json = new org.json.JSONObject(value);
            String sessionId = json.getString("sessionId");
            String qrToken   = json.getString("qrToken");
            submitAttendance(sessionId, qrToken);
        } catch (Exception e) {
            // Try treating the whole value as a qrToken with session from intent
            String sessionId = getIntent().getStringExtra(EXTRA_SESSION_ID);
            if (sessionId != null) {
                submitAttendance(sessionId, value.trim());
            } else {
                tvStatus.setText("Invalid QR code format. Please try again.");
                scanned = false;
            }
        }
    }

    private void submitAttendance(String sessionId, String qrToken) {
        DashboardModels.QrScanRequest req = new DashboardModels.QrScanRequest(sessionId, qrToken);
        api.qrScan(session.getAuthHeader(), req).enqueue(new Callback<DashboardModels.GenericResponse>() {
            @Override public void onResponse(@NonNull Call<DashboardModels.GenericResponse> c,
                                             @NonNull Response<DashboardModels.GenericResponse> r) {
                if (r.isSuccessful()) {
                    tvStatus.setText("✓ Attendance marked successfully!");
                    tvStatus.setTextColor(0xFF10B981);
                    new android.os.Handler().postDelayed(() -> finish(), 2000);
                } else {
                    String err = "Failed to mark attendance";
                    try {
                        if (r.errorBody() != null) {
                            org.json.JSONObject json = new org.json.JSONObject(r.errorBody().string());
                            err = json.optString("error", err);
                        }
                    } catch (Exception ignored) {}
                    final String msg = err;
                    tvStatus.setText("⚠ " + msg);
                    tvStatus.setTextColor(0xFFEF4444);
                    scanned = false;
                }
            }
            @Override public void onFailure(@NonNull Call<DashboardModels.GenericResponse> c,
                                            @NonNull Throwable t) {
                tvStatus.setText("Network error. Please try again.");
                tvStatus.setTextColor(0xFFEF4444);
                scanned = false;
            }
        });
    }

    private void showManualEntryDialog() {
        android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(this);
        builder.setTitle("Enter QR Token Manually");
        final android.widget.EditText input = new android.widget.EditText(this);
        input.setHint("Paste the QR token here");
        builder.setView(input);
        builder.setPositiveButton("Submit", (dialog, which) -> {
            String token = input.getText().toString().trim();
            if (!token.isEmpty()) {
                String sessionId = getIntent().getStringExtra(EXTRA_SESSION_ID);
                if (sessionId != null) {
                    scanned = true;
                    submitAttendance(sessionId, token);
                } else {
                    Toast.makeText(this, "No session ID provided", Toast.LENGTH_SHORT).show();
                }
            }
        });
        builder.setNegativeButton("Cancel", null);
        builder.show();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == CAMERA_PERMISSION_CODE && grantResults.length > 0
                && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            startCamera();
        } else {
            Toast.makeText(this, "Camera permission required to scan QR codes", Toast.LENGTH_LONG).show();
            btnManualEntry.setVisibility(View.VISIBLE);
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        cameraExecutor.shutdown();
    }
}
