package com.smartcampus.connect.utils;

import android.content.Context;
import android.content.SharedPreferences;

/**
 * Centralised session management — reads/writes SharedPreferences.
 */
public class SessionManager {

    private static final String PREFS_NAME = "SmartCampusPrefs";

    private final SharedPreferences prefs;
    private final SharedPreferences.Editor editor;

    public SessionManager(Context context) {
        prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        editor = prefs.edit();
    }

    public void save(String token, String userId, String name, String email,
                     String role, String schoolId, String regNumber, String baseUrl) {
        editor.putString("auth_token", token);
        editor.putString("user_id", userId);
        editor.putString("user_name", name);
        editor.putString("user_email", email);
        editor.putString("user_role", role);
        editor.putString("school_id", schoolId != null ? schoolId : "");
        editor.putString("reg_number", regNumber != null ? regNumber : "");
        editor.putString("api_base_url", baseUrl);
        editor.apply();
    }

    public void clear() {
        editor.clear();
        editor.apply();
    }

    public String getToken()    { return prefs.getString("auth_token", ""); }
    public String getUserId()   { return prefs.getString("user_id", ""); }
    public String getName()     { return prefs.getString("user_name", ""); }
    public String getEmail()    { return prefs.getString("user_email", ""); }
    public String getRole()     { return prefs.getString("user_role", ""); }
    public String getSchoolId() { return prefs.getString("school_id", ""); }
    public String getRegNumber(){ return prefs.getString("reg_number", ""); }
    public String getBaseUrl()  { return prefs.getString("api_base_url",
            "https://ais-dev-kgj4efa3zezeyu4wyibiv3-72418098555.europe-west2.run.app"); }

    public boolean isLoggedIn() {
        return !getToken().isEmpty() && !getRole().isEmpty();
    }

    public String getAuthHeader() {
        return "Bearer " + getToken();
    }
}
