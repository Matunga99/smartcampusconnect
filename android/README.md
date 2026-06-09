# 🎯 SmartCampus Connect X (SUOS) - Android Java Native Application

Welcome to the official, native Java Android client layer for **SmartCampus Connect X / SUOS**! 

This high-performance client app utilizes modern Android architecture concepts to seamlessly interface with the central Node.js/Express full-stack backend service (`server.ts`). It adheres strictly to the requirement of behaving exclusively as an API consumer layer—leaving all business rules, database queries, and system state rules to the robust main server.

---

## 📂 Complete Android Architecture Map

The repository is organized following clean architectural patterns:

```
/android
├── build.gradle                              # Project-wide dependencies & build properties
├── settings.gradle                           # Subsystem declaration & app module anchor
└── app
    ├── build.gradle                          # Android build SDK, namespace, and dependencies
    └── src
        └── main
            ├── AndroidManifest.xml           # App declarations, permissions, launcher intent
            ├── res
            │   ├── layout
            │   │   ├── activity_login.xml    # Gateway UI with API address input
            │   │   ├── activity_profile.xml  # Nested, multi-parameter editor layout
            │   │   ├── activity_super_admin.xml # SuperAdmin specialized dashboard controls
            │   │   ├── activity_admin.xml    # Campus Administrator hub panel
            │   │   ├── activity_lecturer.xml # Academic Staff and lecturer board
            │   │   └── activity_student.xml  # Student digital identity card hub
            │   └── values
            │       ├── strings.xml           # Multi-lingual UI literals
            │       └── themes.xml            # Custom DayNight modern theme constraints
            └── java
                └── com
                    └── smartcampus
                        └── connect
                            ├── LoginActivity.java     # Secure session check & credentials storage
                            ├── SuperAdminActivity.java # Role navigation targets
                            ├── AdminActivity.java
                            ├── LecturerActivity.java
                            ├── StudentActivity.java
                            ├── ProfileActivity.java   # GET & PUT profile data synchronizer
                            ├── api
                            │   ├── ApiClient.java     # Dynamic Retrofit initializer (OkHttp Logger)
                            │   └── ApiService.java    # Retrofit Interface mapping server endpoints
                            └── models
                                ├── AuthModels.java    # JWT Authentication Request/Response structures
                                └── ProfileModels.java # Complex profile nested update definitions
```

---

## ⚡ Key Architectural Features & Libraries

1. **Client-Only Independence**: Absolutely no duplicated business logic. It relies completely on the shared Express REST API.
2. **Retrofit + GSON Converters**: Configured with dynamic base URL support allowing you to test local, emulator, or production environments without hardcoded assets.
3. **OkHttp Logging Interceptors**: Full terminal debug feedback trace for all request-response cycles.
4. **SharedPreferences Secure Tunnel**: Safe, encrypted-by-default persistent caching of the authorization token (JWT), tenant identifier (`schoolId`), full name, email, and user role.
5. **Decentralized Multi-Tenant Routing**: Dynamically displays and filters active context based on the signed-in user's tenant identifier (`schoolId`), facilitating full multi-tenant sandboxing.
6. **Multi-Role Flow Switcher**: On successful login, the application resolves the user's role from the JWT, automatically routing them to the correct dashboard Activity:
   - `superadmin` ➔ `SuperAdminActivity`
   - `admin` ➔ `AdminActivity`
   - `staff` / `lecturer` ➔ `LecturerActivity`
   - `student` ➔ `StudentActivity`

---

## 🌍 Endpoint Consumption Details

The Android application leverages existing Express API definitions to maintain compliance with:

* **Session Authorization**: `POST <api-url>/api/auth/login`
  * Body: `{ "email": "...", "password": "..." }`
  * Response: `{ "token": "...", "user": { "role": "...", "schoolId": "...", ... } }`

* **Bio Retrieval**: `GET <api-url>/api/profile/me`
  * Header: `Authorization: Bearer <token>`
  * Response: Returns the complete user-profile schema including bio and details nested within `profile`.

* **Bio Modification**: `PUT <api-url>/api/profile/me`
  * Header: `Authorization: Bearer <token>`
  * Body: Mapped as `{ "email": "...", "profile": { "phone": "...", "dob": "...", "gender": "...", "address": "...", "bio": "..." } }`
  * Response: `{ "message": "Profile updated successfully", "user": { ... } }`

---

## 🛠️ Step-by-Step Production Setup & Build Guide

### Prerequisities
- **Android Studio (Giraffe / Hedgehog or modern Koala recommended)**
- **JDK 11 or higher** configured in system environment variables (and targeted under Android build configuration settings).

### Execution Instructions
1. Open **Android Studio**.
2. Select **Open an existing project** and navigate directly to the `/android` directory.
3. Allow **Gradle sync** to download dependencies (Retrofit, Gson, CircleImageView, ConstraintLayout, and Material Components).
4. Run/Debug in your Android Virtual Device (AVD Emulator) or connect a physical developer device via USB.
5. Enter the **API Base URL** in the gateway field during launch. 
   - *Tip (Local Emulator Testing)*: If running the Node repository server locally on your workstation, map to `http://10.0.2.2:3000` inside your emulator to bypass local loopback limits.
   - *Tip (Sandbox Cloud Testing)*: Use the default pre-filled development URL which securely proxy-points to the running application backend.

---
🚀 *Crafted beautifully with senior Android & backend architectural guidelines.* Built exclusively on your secure system, this application acts as a clean, responsive client layer.
