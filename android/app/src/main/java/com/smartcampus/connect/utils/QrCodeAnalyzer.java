package com.smartcampus.connect.utils;

import androidx.annotation.NonNull;
import androidx.camera.core.ImageAnalysis;
import androidx.camera.core.ImageProxy;

import com.google.mlkit.vision.barcode.BarcodeScanner;
import com.google.mlkit.vision.barcode.BarcodeScannerOptions;
import com.google.mlkit.vision.barcode.BarcodeScanning;
import com.google.mlkit.vision.barcode.common.Barcode;
import com.google.mlkit.vision.common.InputImage;

import java.util.List;

/**
 * CameraX ImageAnalysis.Analyzer that decodes QR codes using ML Kit.
 * Calls the provided listener on the first successful scan.
 */
public class QrCodeAnalyzer implements ImageAnalysis.Analyzer {

    public interface OnQrDecoded {
        void onDecoded(String value);
    }

    private final OnQrDecoded listener;
    private final BarcodeScanner scanner;

    public QrCodeAnalyzer(OnQrDecoded listener) {
        this.listener = listener;
        BarcodeScannerOptions options = new BarcodeScannerOptions.Builder()
                .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
                .build();
        this.scanner = BarcodeScanning.getClient(options);
    }

    @Override
    public void analyze(@NonNull ImageProxy imageProxy) {
        @SuppressWarnings("UnsafeOptInUsageError")
        android.media.Image mediaImage = imageProxy.getImage();
        if (mediaImage == null) {
            imageProxy.close();
            return;
        }

        InputImage image = InputImage.fromMediaImage(
                mediaImage, imageProxy.getImageInfo().getRotationDegrees());

        scanner.process(image)
                .addOnSuccessListener((List<Barcode> barcodes) -> {
                    if (!barcodes.isEmpty()) {
                        String value = barcodes.get(0).getRawValue();
                        if (value != null) listener.onDecoded(value);
                    }
                })
                .addOnCompleteListener(task -> imageProxy.close());
    }
}
