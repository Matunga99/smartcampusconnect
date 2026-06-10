# Design Document

## SmartCampusConnect X — Master Feature Completion

---

## Overview

This document defines the technical design for completing all 34 feature domains in the SmartCampusConnect X Master Feature List. The architecture is a React/TypeScript SPA frontend with an Express/Node.js backend, a JSON flat-file database (db.json), and a service worker for offline support. All additions follow the existing patterns: tenant-scoped API routes, role-based component rendering, and feature-flag-gated module visibility.

---

## Architecture Summary

```
App.tsx (Router)
  ├── Public Routes  → SchoolPublicWebsite, PublicWebsiteEngine
  ├── Platform Routes (/admin, /superadmin)
  │     ├── SuperAdminDashboard
  │     └── SchoolAdminDashboard
  └── Role Routes (normal portal)
        ├── StudentDashboard
        ├── LecturerDashboard
        ├── ParentDashboard
        ├── SponsorDashboard
        ├── [NEW] RegistrarDashboard
        ├── [NEW] BursarDashboard
        ├── [NEW] HODDashboard
        ├── [NEW] DeanDashboard
        ├── [NEW] PrincipalDashboard
        ├── [NEW] DeputyPrincipalDashboard
        ├── [NEW] BoardMemberDashboard
        ├── [NEW] SecurityOfficerDashboard
        └── [NEW] AlumniDashboard

server.ts (Express API)
  ├── /api/auth/*          — login, logout, me, MFA
  ├── /api/schools/*       — multi-tenant management
  ├── /api/academic/*      — structure, curriculum, timetable
  ├── /api/admissions/*    — [NEW] full admissions lifecycle
  ├── /api/alumni/*        — [NEW] alumni directory, events, donations
  ├── /api/ai/*            — [NEW] predictions, study assistant, advisor
  ├── /api/country/*       — [NEW] country framework config
  └── /api/...             — existing routes

src/types.ts
  └── UserRole extended to 21 roles
```

---

## Component Design

### 1. Extended UserRole Type (`src/types.ts`)

Add all 21 roles to the `UserRole` union type. Add new interfaces: `Application`, `AlumniProfile`, `AlumniEvent`, `AlumniDonation`, `AlumniJobPost`, `AIRiskScore`, `CountryFramework`, `DisciplineRecord`, `MedicalRecord`, `StudentTransfer`.

### 2. App.tsx Router Additions

Extend Segment 3 (NORMAL APP ROUTES) to handle all new roles. Each new role maps to a dedicated dashboard component. Unknown roles render a "Portal coming soon" screen.

### 3. Admissions Management (`src/components/AdminAdmissionsEngine.tsx`)

New component with tabs:
- **Applications** — list all applications with status badges and funnel metrics
- **Application Detail** — view/advance application through stages with document viewer
- **Intake Config** — set capacity, dates, required documents per program
- **Entrance Exams** — schedule exams, record scores
- **Enrollment** — convert admitted applicants to students, generate student IDs

API routes: `POST /api/admissions/apply`, `GET /api/admissions`, `PUT /api/admissions/:id/advance`, `POST /api/admissions/:id/enroll`

Public-facing: Application form embedded in `SchoolPublicWebsite` under an "Apply" tab.

### 4. Alumni Management (`src/components/AlumniDashboard.tsx` + `src/components/AdminAlumniManagement.tsx`)

**AlumniDashboard** — self-service portal for alumni users:
- Profile tab: view/edit employment, contact, LinkedIn
- Events tab: upcoming events with RSVP buttons
- Jobs tab: job board filtered by field of study
- Network tab: cohort connections grid

**AdminAlumniManagement** — admin panel tab for managing alumni:
- Directory with search and export
- Event management (create, edit, delete)
- Donation campaigns and pledge tracking

Auto-trigger: When student state → `GRADUATED`, create AlumniProfile + send activation email.

### 5. Role Dashboards — 9 New Components

All share a common pattern: fetch relevant data scoped to `schoolId` (and `departmentId` for HOD), render KPI cards + action list + communications shortcut.

| Component | Key Data | Key Actions |
|---|---|---|
| `RegistrarDashboard` | Admissions queue, enrollments, academic records | Advance applications, generate transcripts |
| `BursarDashboard` | Daily collections, outstanding balances, payment plans | Post receipts, generate fee statements |
| `HODDashboard` | Dept staff, unit allocations, dept student performance | Approve leave, review timetable |
| `DeanDashboard` | Faculty programs, research projects, publications | Approve research, view faculty analytics |
| `PrincipalDashboard` | School-wide KPIs, announcements, attendance rate | Publish announcements, approve policies |
| `DeputyPrincipalDashboard` | Staff attendance, discipline records, academic ops | Record discipline, manage academic calendar |
| `BoardMemberDashboard` | Read-only: finance, enrollment, performance, compliance | Export reports only |
| `SecurityOfficerDashboard` | Visitor log, hostel access, incidents | Log visitors, record incidents |
| `AlumniDashboard` | Profile, events, job board, network | RSVP events, update profile, post jobs |

### 6. AI Engine (`src/components/AdminAIEngine.tsx` + `src/lib/aiEngine.ts`)

Frontend component with tabs:
- **Risk Dashboard** — table of at-risk students with dropout + fee default scores, intervention flags
- **Predictions** — attendance forecast charts per unit, timetable optimization suggestions
- **AI Assistant** — student-facing study assistant chat (embedded in StudentDashboard)
- **AI Reports** — one-click narrative summary generation for analytics sections
- **Academic Advisor** — chatbot suggesting course registrations (embedded in StudentDashboard registration tab)

Backend (`src/lib/aiEngine.ts`): deterministic scoring functions using attendance %, grade trend, fee payment history, login frequency. No external ML dependency — rule-based scoring suitable for production without AI API keys.

### 7. Country Frameworks (`src/lib/countryFrameworks.ts`)

Static configuration map for 6 countries with:
- Education level structure (grades, terms/semesters)
- Payroll deduction rules (tax brackets, statutory deductions)
- National exam identifiers
- Regulatory report templates

Exposed in SuperAdmin architecture → country sub-tab as a configuration viewer/editor.

### 8. Parent Portal Completion (`src/components/ParentDashboard.tsx`)

Add missing tabs:
- **Transport** — route map + vehicle location for subscribed routes
- **Homework** — assignment due dates across all linked children

### 9. SIS Completion (`SchoolAdminDashboard` → students tab)

Extend student detail modal to include:
- Medical records sub-tab (allergies, conditions, vaccinations, visits)
- Discipline records sub-tab (incident log)
- Transfers sub-tab
- Promotions/graduation tracking

### 10. db.json Schema Additions

New collections: `applications`, `alumniProfiles`, `alumniEvents`, `alumniDonations`, `alumniJobs`, `aiRiskScores`, `disciplineRecords`, `medicalRecords`, `studentTransfers`, `countryFrameworks`, `incidents`.

---

## Data Models

```typescript
// Admissions
interface Application {
  id: string; schoolId: string; intakeId: string; programId: string;
  applicantName: string; applicantEmail: string; applicantPhone: string;
  status: 'submitted'|'under_review'|'shortlisted'|'interview_scheduled'|'admitted'|'rejected'|'waitlisted';
  refNumber: string; documents: string[]; entranceScore?: number;
  waitlistRank?: number; submittedAt: string; updatedAt: string;
}

// Alumni
interface AlumniProfile {
  id: string; schoolId: string; studentId: string; userId?: string;
  graduationYear: number; programName: string; currentEmployer?: string;
  location?: string; email: string; linkedinUrl?: string; isActivated: boolean;
}
interface AlumniEvent { id: string; schoolId: string; title: string; date: string; location: string; capacity: number; rsvps: { userId: string; status: 'attending'|'declined' }[]; }
interface AlumniDonation { id: string; schoolId: string; donorAlumniId: string; amount: number; currency: string; campaign: string; status: 'pledged'|'partially_paid'|'fulfilled'; pledgeDate: string; }
interface AlumniJobPost { id: string; schoolId: string; postedByAlumniId: string; title: string; company: string; location: string; description: string; deadline: string; }

// AI
interface AIRiskScore { id: string; schoolId: string; studentId: string; dropoutScore: number; feeDefaultScore: number; interventionFlag: boolean; computedAt: string; }

// SIS Extensions
interface DisciplineRecord { id: string; schoolId: string; studentId: string; incidentDate: string; type: string; description: string; actionTaken: string; resolvedAt?: string; }
interface MedicalRecord { id: string; schoolId: string; studentId: string; bloodType?: string; allergies: string[]; conditions: string[]; visitDate: string; complaint: string; diagnosis: string; treatment: string; prescription?: string; }
interface StudentTransfer { id: string; schoolId: string; studentId: string; direction: 'in'|'out'; fromInstitution: string; transferDate: string; academicStanding: string; }

// Country
interface CountryFramework { code: string; name: string; educationLevels: string[]; termStructure: string; payrollRules: Record<string, any>; nationalExams: string[]; }
```

---

## API Route Plan

| Method | Route | Role | Description |
|---|---|---|---|
| POST | /api/admissions/apply | public | Submit new application |
| GET | /api/admissions | admin, registrar | List all applications for school |
| PUT | /api/admissions/:id/advance | admin, registrar | Advance application status |
| POST | /api/admissions/:id/enroll | admin, registrar | Convert to student record |
| GET | /api/alumni | admin, alumni | List alumni profiles |
| PUT | /api/alumni/:id | alumni | Update own profile |
| GET | /api/alumni/events | alumni, admin | List events |
| POST | /api/alumni/events | admin | Create event |
| POST | /api/alumni/events/:id/rsvp | alumni | RSVP to event |
| GET | /api/ai/risks | admin, hod, dean | Get AI risk scores |
| POST | /api/ai/compute | admin | Trigger risk computation |
| GET | /api/ai/timetable-suggestions | admin | Get optimization suggestions |
| GET | /api/country-frameworks | superadmin | List all frameworks |
| PUT | /api/country-frameworks/:code | superadmin | Update framework config |
| GET | /api/sis/:studentId/medical | admin, health | Get medical records |
| POST | /api/sis/:studentId/medical | admin, health | Add medical record |
| GET | /api/sis/:studentId/discipline | admin | Get discipline records |
| POST | /api/sis/:studentId/discipline | admin | Add discipline record |
| GET | /api/sis/:studentId/transfers | admin, registrar | Get transfer records |

---

## Integration Points

- **Admissions → Workflow Engine**: `student_admitted` event fires on enrollment
- **Admissions → Document Engine**: admission letter generated on status → `admitted`
- **Alumni → Student State Machine**: GRADUATED transition auto-creates AlumniProfile
- **AI Engine → Attendance data**: reads `/api/attendance` aggregates
- **AI Engine → Finance data**: reads outstanding balance from finance records
- **AI Engine → Grade data**: reads course registrations with grades
- **Country Framework → HR Payroll**: payroll deductions use country rules
- **SIS Medical → Campus Health**: health module reads/writes same records
- **Parent Portal Transport → Campus Life**: transport routes and vehicle data shared

---

## File Creation Plan

### New Source Files
```
src/components/AdminAdmissionsEngine.tsx
src/components/AlumniDashboard.tsx
src/components/AdminAlumniManagement.tsx
src/components/AdminAIEngine.tsx
src/components/RegistrarDashboard.tsx
src/components/BursarDashboard.tsx
src/components/HODDashboard.tsx
src/components/DeanDashboard.tsx
src/components/PrincipalDashboard.tsx
src/components/DeputyPrincipalDashboard.tsx
src/components/BoardMemberDashboard.tsx
src/components/SecurityOfficerDashboard.tsx
src/lib/aiEngine.ts
src/lib/countryFrameworks.ts
src/lib/admissionsEngine.ts
```

### Modified Files
```
src/types.ts                          — extended UserRole + new interfaces
src/App.tsx                           — new role routing
src/components/SchoolAdminDashboard.tsx — add Admissions + Alumni tabs
src/components/ParentDashboard.tsx    — add Transport + Homework tabs
src/components/StudentDashboard.tsx   — add AI Study Assistant + Advisor
db.json                               — new collections seeded
server.ts                             — new API routes
```
