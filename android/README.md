# SmartCampusConnect X — Android App

A fully-connected native Android client for the SmartCampusConnect X backend.

## Architecture

```
android/
├── app/               # Main application module
│   └── src/main/java/com/smartcampus/connect/
│       ├── LoginActivity.java          — Auth gateway (all roles)
│       ├── StudentActivity.java        — Student portal (6 tabs)
│       ├── LecturerActivity.java       — Lecturer workspace (5 tabs)
│       ├── AdminActivity.java          — School admin console (5 tabs)
│       ├── SuperAdminActivity.java     — Super admin global view (3 tabs)
│       ├── ProfileActivity.java        — Shared profile editor
│       ├── DashboardPagerAdapter.java  — Generic tab pager adapter
│       ├── api/
│       │   ├── ApiClient.java          — Retrofit factory (dynamic base URL)
│       │   └── ApiService.java         — All 30+ API endpoint interfaces
│       ├── models/
│       │   ├── AuthModels.java         — Login/session models
│       │   ├── ProfileModels.java      — Profile request/response
│       │   └── DashboardModels.java    — All dashboard data models
│       ├── fragments/
│       │   └── DashboardTabFragment.java — Role-aware tab fragment
│       └── utils/
│           ├── SessionManager.java     — SharedPreferences wrapper
│           └── UiHelper.java           — Dynamic card builder
└── sdk/               # Reusable SDK library module (SuosSDK)
    └── SuosSDK.java   — Single-entry-point SDK for third-party integrations
```

## Features by Role

### Student
- Overview with announcements
- Registered units with attendance & grades
- Timetable / class schedule
- Exam results & transcript
- Finance: invoices & fee balances
- Library: borrowings & fines

### Lecturer / Staff
- Overview with announcements
- Teaching assignments
- Attendance session management
- Grade students

### School Admin
- Dashboard with school stats
- Full students directory
- Staff directory
- Academic years management

### Super Admin
- Platform overview (total schools, students, staff)
- All institutions list with enable/disable status

## Setup

1. Open the `android/` folder in **Android Studio Hedgehog (2023.1.1)** or later.
2. Build the project — all dependencies are fetched via Gradle.
3. On the Login screen enter your **API Server URL** (e.g. `https://your-server.app`).
4. Use any valid account credentials from your SmartCampusConnect X backend.

## Default Test Accounts

| Role       | Email                     | Password  |
|------------|---------------------------|-----------|
| SuperAdmin | superadmin.com            | 12345678  |
| Admin      | admin@nairobi.edu         | 12345678  |
| Lecturer   | lecturer@nairobi.edu      | 12345678  |
| Student    | student@nairobi.edu       | 12345678  |

## SDK Usage (for third-party integrations)

```java
// Initialize once (e.g., in Application.onCreate)
SuosSDK.initialize("https://your-server.app");

// Login
SuosSDK.getInstance().login(email, password, new Callback<AuthModels.LoginResponse>() {
    @Override public void onResponse(Call<LoginResponse> c, Response<LoginResponse> r) {
        if (r.isSuccessful()) {
            SuosSDK.getInstance().setAuthToken(r.body().token);
        }
    }
    @Override public void onFailure(Call<LoginResponse> c, Throwable t) { }
});

// Get student registrations
SuosSDK.getInstance().getMyRegistrations(new Callback<List<SdkModels.CourseRegistration>>() { ... });

// Admin: get all students
SuosSDK.getInstance().getStudents(new Callback<List<SdkModels.Student>>() { ... });
```
