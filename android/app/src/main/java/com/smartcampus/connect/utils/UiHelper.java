package com.smartcampus.connect.utils;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.smartcampus.connect.R;

/**
 * Helper for dynamically building card rows inside a LinearLayout container.
 */
public class UiHelper {

    public static void showToast(Context ctx, String msg) {
        Toast.makeText(ctx, msg, Toast.LENGTH_SHORT).show();
    }

    /**
     * Inflates an item_card.xml row and adds it to the provided container.
     *
     * @param container  The LinearLayout to append the card to.
     * @param title      Bold title text.
     * @param subtitle   Subtitle / description text.
     * @param meta       Small footer metadata (optional, pass null to hide).
     * @param badgeText  Badge label (optional, pass null to hide).
     * @param badgeColor Hex colour string for badge text e.g. "#10b981".
     */
    public static void addCard(LinearLayout container, String title,
                               String subtitle, String meta,
                               String badgeText, String badgeColor) {

        Context ctx = container.getContext();
        View card = LayoutInflater.from(ctx).inflate(R.layout.item_card, container, false);

        TextView tvTitle    = card.findViewById(R.id.tv_item_title);
        TextView tvSubtitle = card.findViewById(R.id.tv_item_subtitle);
        TextView tvMeta     = card.findViewById(R.id.tv_item_meta);
        TextView tvBadge    = card.findViewById(R.id.tv_item_badge);

        tvTitle.setText(title != null ? title : "—");
        tvSubtitle.setText(subtitle != null ? subtitle : "");

        if (meta != null && !meta.isEmpty()) {
            tvMeta.setText(meta);
            tvMeta.setVisibility(View.VISIBLE);
        } else {
            tvMeta.setVisibility(View.GONE);
        }

        if (badgeText != null && !badgeText.isEmpty()) {
            tvBadge.setText(badgeText);
            tvBadge.setVisibility(View.VISIBLE);
            try {
                tvBadge.setTextColor(android.graphics.Color.parseColor(badgeColor != null ? badgeColor : "#10b981"));
            } catch (Exception ignored) {}
        } else {
            tvBadge.setVisibility(View.GONE);
        }

        container.addView(card);
    }

    public static String statusColor(String status) {
        if (status == null) return "#64748b";
        switch (status.toLowerCase()) {
            case "active":
            case "cleared":
            case "approved":
            case "present":    return "#10b981";
            case "pending":
            case "processing": return "#f59e0b";
            case "suspended":
            case "blocked":
            case "overdue":
            case "rejected":   return "#ef4444";
            default:           return "#94a3b8";
        }
    }
}
