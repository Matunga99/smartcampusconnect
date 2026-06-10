# Requirements Document

## SmartCampusConnect X — Master Feature Completion Audit

## Introduction

SmartCampusConnect X is a multi-tenant SaaS platform serving educational institutions across Africa and beyond. The platform supports 8 institution types (Lower Primary, Primary, Secondary, TVET, College, University, Training Center, Corporate Academy) with role-based access for all stakeholders. This document defines requirements for all 34 feature domains in the Master Feature List, distinguishing between what is already implemented and what must be built or completed. The goal is to ensure every domain is fully implemented, connected, and auditable with no gaps.

---

## Glossary

- **Platform**: The SmartCampusConnect X SaaS system as a whole
- **Tenant**: A single institution (school, college, university, etc.) provisioned on the Platform
- **SuperAdmin**: The cloud-level administrator who manages all tenants and platform operations
- **SchoolAdmin**: An institution-level administrator (maps to the `admin` role)
- **UserRole**: The enumerated type defining all recognized roles in the system
- **App_Router**: The `App.tsx` routing component that directs authenticated users to their dashboards
- **Admissions_System**: The module handling online applications through to enrollment
- **SIS**: Student Information System — the central store for student profiles, records, and lifecycle data
- **LMS**: Learning Management System — courses, materials, assignments, quizzes, certificates
- **AI_Engine**: The artificial intelligence layer providing predictions, recommendations, and automation
- **Parent_Portal**: The `ParentDashboard` component serving guardian users
- **Alumni_System**: The module managing post-graduation alumni records, events, and engagement
- **Research_Portal**: The `LecturerResearchPortal` and supporting modules for research management
- **Mobile_Ecosystem**: The unified mobile-first experience layer across all role portals
- **Country_Framework**: The per-country education regulatory and payroll rules engine
- **RBAC**: Role-Based Access Control — the permission engine governing all data access
- **EARS**: Easy Approach to Requirements Syntax — the pattern used for all acceptance criteria
- **Registrar**: Staff role responsible for admissions, enrollment, and academic records
- **Bursar**: Staff role responsible for fee collection and financial operations
- **HOD**: Head of Department — academic leadership role
- **Dean**: Faculty-level academic leadership role
- **Principal**: Institutional head for primary and secondary schools
- **DeputyPrincipal**: Second in command to Principal
- **BoardMember**: Governance-level stakeholder with read-only executive access
- **SecurityOfficer**: Campus security staff role

---

## Requirements

---

### Requirement 1: Multi-Tenant SaaS Core

**User Story:** As a SuperAdmin, I want to provision, manage, and monitor multiple institution tenants from a central control center, so that each institution operates in complete isolation with its own branding, data, and configuration.

#### Acceptance Criteria

1. THE Platform SHALL enforce `schoolId`-based data isolation for every database operation across all tenants.
2. WHEN a new institution is provisioned, THE Platform SHALL apply the institution type template (Lower Primary, Primary, Secondary, TVET, College, University, Training Center, or Corporate Academy) to pre-configure terminology, modules, and workflows.
3. WHEN a tenant's subscription plan changes, THE Platform SHALL activate or deactivate the corresponding feature modules within 60 seconds.
4. THE Platform SHALL support custom domain routing using school code paths (e.g., `/school/{code}`) so each institution has a unique public URL.
5. WHEN a tenant is suspended, THE Platform SHALL deny login to all users of that tenant and display a suspension notice.
6. WHEN a tenant is reactivated, THE Platform SHALL restore full user access without data loss.
7. THE Platform SHALL track per-tenant usage metrics including active users, storage consumed, and API call volumes.
8. THE SuperAdmin_Dashboard SHALL display a topology view of all tenants with their subscription plan, status, and key health indicators.
9. WHERE a multi-campus flag is enabled for a tenant, THE Platform SHALL support campus-scoped data segmentation within the same tenant.

---

### Requirement 2: Institution Types and Templates

**User Story:** As a SuperAdmin, I want each institution type to have its own terminology, hierarchy, and module configuration, so that the platform feels native to every category of educational institution.

#### Acceptance Criteria

1. THE Platform SHALL support exactly 8 institution types: Lower Primary, Primary, Secondary, TVET, College, University, Training Center, and Corporate Academy.
2. WHEN an institution type is selected during provisioning, THE Platform SHALL load the corresponding `INSTITUTION_TEMPLATES` configuration including terminology mappings, enabled modules, and workflow defaults.
3. THE Platform SHALL apply institution-type terminology consistently across all UI labels, reports, and communications so that a University sees "Faculty/Dean" while a Primary school sees "Department/Head Teacher".
4. WHERE a tenant administrator customizes a terminology mapping, THE Platform SHALL persist that override and apply it in all subsequent renders for that tenant.
5. THE Platform SHALL include a Blueprint viewer in the SuperAdmin architecture tab that shows the full module map and terminology for any selected institution type.

---

### Requirement 3: User Management and Extended Roles

**User Story:** As a SchoolAdmin, I want to manage all staff, student, parent, and specialized role accounts with fine-grained permissions, so that each user sees only the data and actions relevant to their role.

#### Acceptance Criteria

1. THE `UserRole` type SHALL include all of the following roles: `superadmin`, `admin`, `staff`, `student`, `parent`, `sponsor`, `alumni`, `boardmember`, `registrar`, `bursar`, `hod`, `dean`, `principal`, `deputyprincipal`, `librarian`, `hostelmanager`, `transportmanager`, `hrofficer`, `procurementofficer`, `accountant`, `securityofficer`.
2. THE RBAC_Engine SHALL enforce permission checks for every API endpoint based on the requesting user's role and `schoolId`.
3. THE Platform SHALL support bulk user import via CSV for students and staff with validation reporting.
4. WHEN a user's status is set to suspended, THE Platform SHALL immediately invalidate all active sessions for that user.
5. THE Platform SHALL maintain an audit trail of all user creation, modification, role change, and deletion events including the acting user's ID and timestamp.
6. WHERE Multi-Factor Authentication is enabled for a tenant, THE Platform SHALL require MFA on login for all admin-tier roles.
7. THE SchoolAdmin_Dashboard SHALL provide a user directory with search, filter by role, and bulk status management.
8. WHEN a new staff member is created with a specialized role (Registrar, Bursar, HOD, Dean, etc.), THE Platform SHALL assign the corresponding role-specific dashboard route upon login.

---

### Requirement 4: Role-Specific Dashboards — Missing Roles

**User Story:** As a specialized staff member (Registrar, Bursar, HOD, Dean, Principal, DeputyPrincipal, BoardMember, SecurityOfficer, Alumni), I want a dedicated dashboard tailored to my responsibilities, so that I can perform my duties without navigating through irrelevant sections.

#### Acceptance Criteria

1. IF a user's `role` is `registrar`, THEN THE App_Router SHALL render a `RegistrarDashboard` component displaying the admissions queue, enrollment records, and academic records management panel.
2. IF a user's `role` is `bursar`, THEN THE App_Router SHALL render a `BursarDashboard` component displaying fee collection totals, payment tracking, outstanding balances, and a daily receipts summary.
3. IF a user's `role` is `hod`, THEN THE App_Router SHALL render a `HODDashboard` component scoped to the user's assigned `departmentId`, displaying staff in that department, unit allocations, timetable for those units, and student performance metrics for that department only.
4. IF a user's `role` is `dean`, THEN THE App_Router SHALL render a `DeanDashboard` component displaying faculty-level academic performance, program oversight metrics, and research project summaries for all departments within the user's faculty.
5. IF a user's `role` is `principal`, THEN THE App_Router SHALL render a `PrincipalDashboard` component displaying school-wide KPIs including total enrollment, attendance rate, GPA distribution, outstanding fee balance aggregate, and the three most recent school announcements.
6. IF a user's `role` is `deputyprincipal`, THEN THE App_Router SHALL render a `DeputyPrincipalDashboard` component displaying academic operations status, staff attendance summary for the current day, and a list of open disciplinary records.
7. IF a user's `role` is `boardmember`, THEN THE App_Router SHALL render a `BoardMemberDashboard` component displaying read-only executive summaries for finance, enrollment, academic performance, and compliance — no create, update, or delete controls SHALL be rendered for board members.
8. IF a user's `role` is `securityofficer`, THEN THE App_Router SHALL render a `SecurityOfficerDashboard` component displaying the hostel visitor log, access records, and incident report history.
9. IF a user's `role` is `alumni`, THEN THE App_Router SHALL render an `AlumniDashboard` component displaying the alumni's profile, upcoming event invitations with RSVP controls, job board listings, and a section listing first-degree network connections from the same graduation cohort.
10. WHILE THE App_Router is resolving a user's role after authentication, THE App_Router SHALL display a loading indicator.
11. IF a user's role does not match any defined dashboard route, THEN THE App_Router SHALL display a clearly labeled "Portal coming soon" screen with the user's name and role displayed, without crashing or throwing an unhandled exception.

---

### Requirement 5: Admissions Management System

**User Story:** As a Registrar, I want to manage the complete admissions lifecycle from online application through enrollment, so that prospective students can apply online and be tracked through every stage of admission.

#### Acceptance Criteria

1. THE Admissions_System SHALL provide a publicly accessible online application form linked to the institution's public website.
2. WHEN an applicant submits an application, THE Admissions_System SHALL assign a unique application reference number and send a confirmation notification to the applicant's email within 5 minutes of submission.
3. THE Admissions_System SHALL support document uploads (transcripts, ID, passport photo, supporting letters) restricted to PDF, JPG, and PNG file types with a maximum size of 5 MB per file and a maximum of 10 documents per application; submissions exceeding these limits SHALL be rejected with a descriptive validation message.
4. IF a Registrar advances an application, THEN THE Admissions_System SHALL enforce the following valid transition sequence only: Submitted → Under Review → Shortlisted → Interview Scheduled → Admitted or Rejected or Waitlisted; illegal transitions SHALL be rejected with an error message.
5. WHEN an application is admitted, THE Admissions_System SHALL generate an admission letter using the Document_Engine and deliver it to the applicant's registered email within 10 minutes of the status change.
6. WHEN a Registrar explicitly marks document verification as complete AND the Finance subsystem confirms full payment of the admission fee, THE Admissions_System SHALL create a Student record, assign a unique registration number, and set the student's academic state to `ADMITTED`.
7. THE Admissions_System SHALL support entrance exam scheduling and score recording linked to applications.
8. WHEN an admitted student declines their offer, THE Admissions_System SHALL automatically advance the applicant with the lowest waitlist rank number to Admitted status and notify that applicant within 5 minutes of the decline event.
9. THE SchoolAdmin SHALL be able to configure intake capacity (between 1 and 10,000 per program), application open and close dates, and a list of required document types per program.
10. THE Admissions_System SHALL provide a dashboard showing application funnel metrics: total applications, count by status, count by program, and conversion rate calculated as (Admitted ÷ total submitted) × 100%.
11. WHEN a student is enrolled from admissions, THE Platform SHALL trigger the `student_admitted` workflow event to activate downstream automations.
12. WHEN an application deadline passes, THE Admissions_System SHALL automatically close the application form within 5 minutes and send a notification to the Registrar's registered email address.
13. WHEN an application transitions to Rejected or Waitlisted status, THE Admissions_System SHALL send a notification to the applicant's registered email within 10 minutes of the status change.

---

### Requirement 6: Student Information System (SIS) — Complete Profile

**User Story:** As a Registrar or SchoolAdmin, I want a comprehensive student profile that includes academic, medical, disciplinary, guardian, sponsor, and transfer records, so that all student data is centralized and auditable.

#### Acceptance Criteria

1. THE SIS SHALL store a complete student profile including: personal details, contact information, guardian/parent links, sponsor links, medical records, disciplinary records, academic history, enrollment records, and document attachments.
2. THE SIS SHALL support student promotions where a student's level advances upon meeting academic requirements at end of academic year.
3. THE SIS SHALL track student transfers in and out, recording the source institution, transfer date, and academic standing at time of transfer.
4. THE SIS SHALL maintain graduation tracking with a graduation checklist (units completed, fees cleared, documents submitted) and a graduation date field.
5. WHEN a student's academic state transitions (ADMITTED → ACTIVE → EXAM_READY → GRADUATING → GRADUATED), THE SIS SHALL log the transition with timestamp and triggering actor.
6. THE SIS SHALL link each student record to one or more guardian/parent user accounts for parent portal access.
7. THE SIS SHALL link each student record to sponsor user accounts with visibility controls on financial data.
8. THE SIS SHALL store medical records per student including allergies, chronic conditions, vaccinations, and medical visit history, accessible only to Health staff and admin.
9. THE SIS SHALL store disciplinary records per student including incident date, type, description, action taken, and resolution status.
10. IF a student has an outstanding fee balance exceeding the configured threshold, THEN THE SIS SHALL flag the student as "Fee Defaulter" and restrict exam registration.

---

### Requirement 7: Academic Structure Engine

**User Story:** As a SchoolAdmin, I want to define and manage the complete academic structure of my institution including departments, programs, units, levels, semesters, and academic years, so that all academic operations are organized around a consistent hierarchy.

#### Acceptance Criteria

1. THE Academic_Structure_Engine SHALL support hierarchical entities: Department → Program → Unit with `schoolId` scoping.
2. THE Academic_Structure_Engine SHALL support Levels, Semesters, Academic Years, Intakes, and Class Groups as configurable entities per tenant.
3. WHEN an Academic Year is set to `active`, THE Platform SHALL apply it as the default context for timetables, registrations, and examinations.
4. THE Academic_Structure_Engine SHALL use the Dynamic Entity Builder to allow SchoolAdmins to add custom entities beyond the default set.
5. THE Platform SHALL enforce referential integrity so that deleting a Program is blocked if active Student enrollments exist under it.
6. WHEN an intake is created, THE Academic_Structure_Engine SHALL associate it with specific programs and academic years, controlling which students can register.

---

### Requirement 8: Curriculum Management

**User Story:** As a SchoolAdmin or HOD, I want to map units to programs by level and semester and attach syllabi and lesson plans, so that the academic curriculum is formally structured and accessible to lecturers and students.

#### Acceptance Criteria

1. THE Curriculum_Engine SHALL allow mapping of Units to Programs by Level and Semester, storing the result as `ProgramCurriculum` records.
2. THE Curriculum_Engine SHALL support unit type classification (Core or Elective) per program-curriculum mapping.
3. WHEN a lecturer views their assigned units, THE Platform SHALL display the syllabus topics linked to each unit from the curriculum mapping.
4. THE Curriculum_Engine SHALL allow attachment of lesson plan documents to each unit-semester-program mapping.
5. THE Curriculum_Engine SHALL support prerequisite unit definition so that a student cannot register for a unit without passing its prerequisites.

---

### Requirement 9: Timetable Engine

**User Story:** As a SchoolAdmin, I want to automatically generate conflict-free timetables for all class groups, so that every unit is scheduled with a qualified lecturer in an available room.

#### Acceptance Criteria

1. THE Timetable_Engine SHALL auto-generate timetables by assigning units to time slots while checking for lecturer conflicts, room conflicts, and class group conflicts.
2. WHEN a conflict is detected during generation, THE Timetable_Engine SHALL surface the conflict with a descriptive message identifying the affected lecturer, room, or class group.
3. THE Timetable_Engine SHALL allow manual override of generated slots by authorized users.
4. THE Timetable_Engine SHALL display the generated timetable in a weekly grid view filterable by class group, lecturer, or room.
5. WHEN a timetable is published, THE Platform SHALL make it visible to all students and lecturers in the affected class groups.

---

### Requirement 10: Attendance Management

**User Story:** As a Lecturer or SchoolAdmin, I want to record and monitor student and staff attendance using multiple methods, so that attendance records are accurate and low-attendance situations trigger timely interventions.

#### Acceptance Criteria

1. THE Attendance_System SHALL support QR code-based attendance marking where lecturers broadcast a session QR code and students scan to mark presence.
2. THE Attendance_System SHALL support PIN-based attendance as an alternative to QR scanning.
3. WHEN a student's attendance falls below the configured threshold (default 75%), THE Platform SHALL flag the student and notify their lecturer and academic advisor.
4. THE Attendance_System SHALL support staff attendance recording separate from student attendance.
5. THE Attendance_System SHALL generate per-unit and per-student attendance summary reports accessible to SchoolAdmin and HOD.
6. WHEN an attendance session is closed, THE Platform SHALL mark absent all enrolled students who did not submit presence.

---

### Requirement 11: Examination and Results System

**User Story:** As a Lecturer or SchoolAdmin, I want to manage the full examination lifecycle from exam creation to grade publishing, with automatic GPA and CGPA calculation, so that student academic performance is accurately computed and transparently reported.

#### Acceptance Criteria

1. THE Examination_System SHALL support multiple assessment types: CATs, Assignments, Online Exams, and End-of-Semester Exams.
2. THE Examination_System SHALL calculate GPA per semester and CGPA across all completed semesters using the institution's configured grading scale.
3. WHEN a lecturer submits grades for a unit, THE Examination_System SHALL validate the grades against the configured grading boundaries before saving.
4. THE Examination_System SHALL generate official transcripts as PDF documents using the Document_Engine upon request.
5. THE Examination_System SHALL produce merit lists ranked by GPA for each program-level-semester combination.
6. THE Student_Results_Portal SHALL display each student's results by semester with grade breakdown, GPA, and CGPA.
7. IF a student's CGPA falls below the minimum passing threshold, THEN THE Examination_System SHALL flag the student for academic probation.
8. THE Examination_System SHALL support online exam delivery with time limits, randomized questions, and auto-grading for objective questions.

---

### Requirement 12: Learning Management System (LMS)

**User Story:** As a Lecturer or SchoolAdmin, I want to deliver course content, assignments, quizzes, and live or recorded classes through an integrated LMS, so that students can access all learning materials and activities in one place.

#### Acceptance Criteria

1. THE LMS SHALL allow lecturers to create courses, upload materials (PDF, video, audio, documents), and organize content by topic or week.
2. THE LMS SHALL support assignment submission by students with file upload and a deadline enforcement mechanism.
3. THE LMS SHALL support quiz creation with multiple-choice, true/false, and short-answer question types.
4. THE LMS SHALL support scheduled online classes with video call integration and recorded playback.
5. THE LMS SHALL provide discussion forums per unit where students and lecturers can post and reply.
6. WHEN a student completes all required activities in a course, THE LMS SHALL generate a course completion certificate using the Document_Engine.
7. THE LMS SHALL track student progress per course showing completed materials, pending assignments, and quiz scores.
8. WHERE the CBT marketplace module is installed, THE LMS SHALL integrate Computer-Based Testing workflows for formal assessments.

---

### Requirement 13: Communication Hub

**User Story:** As any authenticated user, I want to send and receive messages, join group channels, participate in video calls, and receive system notifications, so that all platform communication happens within the application.

#### Acceptance Criteria

1. THE Communications_Hub SHALL support direct one-to-one messaging between any two users within the same tenant.
2. THE Communications_Hub SHALL support group channels scoped to class groups, departments, or institution-wide audiences.
3. THE Communications_Hub SHALL support broadcast announcements sent by admin-tier roles to all users or filtered groups.
4. THE Communications_Hub SHALL deliver notifications via in-app, email, and SMS channels based on per-user notification preferences.
5. THE Communications_Hub SHALL display read receipts for direct messages.
6. THE Communications_Hub SHALL support voice and video call initiation between users within the same tenant.
7. THE Communications_Hub SHALL support screen sharing during video sessions.
8. THE Communications_Hub SHALL show online presence indicators for users.
9. WHEN a new direct message is received, THE Communications_Hub SHALL show a badge count on the messaging icon.
10. THE Communications_Hub SHALL support push notification delivery to registered mobile devices.

---

### Requirement 14: Finance Management

**User Story:** As a Bursar or SchoolAdmin, I want to manage the complete financial lifecycle including student billing, payments, scholarships, and institutional budgets, so that all financial data is accurately tracked and reported.

#### Acceptance Criteria

1. THE Finance_Engine SHALL maintain a Chart of Accounts for each tenant with income, expense, asset, and liability categories.
2. THE Finance_Engine SHALL support student fee billing by generating invoices based on fee categories configured per program and level.
3. WHEN a payment is received, THE Finance_Engine SHALL generate a receipt and update the student's account balance.
4. THE Finance_Engine SHALL support scholarship and waiver application reducing or eliminating a student's outstanding balance.
5. THE Finance_Engine SHALL support payment plan creation allowing students to pay in installments with a configurable schedule.
6. THE Finance_Engine SHALL support institutional budget creation, allocation to departments, and expenditure tracking against budget.
7. THE Finance_Engine SHALL produce financial reports: daily collection summaries, outstanding fee reports, expenditure summaries, and income statements.
8. WHEN a student's fee balance is fully cleared, THE Platform SHALL trigger the `fee_paid` workflow event.
9. THE Student_Finance_Portal SHALL display each student's fee statement, payment history, and any active payment plans.
10. THE Finance_Engine SHALL integrate with the configured payment gateways (M-Pesa, Airtel Money, Visa, Mastercard, Bank Transfer, Stripe, PayPal) to record and reconcile payments.

---

### Requirement 15: Payment Gateway Integrations

**User Story:** As a student or parent, I want to pay fees using my preferred payment method, so that I can complete financial obligations without leaving the platform.

#### Acceptance Criteria

1. THE Payment_Gateway_Layer SHALL support the following payment methods: M-Pesa, Airtel Money, Visa, Mastercard, Bank Transfer, Stripe, and PayPal.
2. WHEN a payment is initiated via M-Pesa, THE Payment_Gateway_Layer SHALL trigger an STK push to the student's registered phone number.
3. WHEN a payment gateway returns a success callback, THE Payment_Gateway_Layer SHALL record the transaction and update the student's balance within 30 seconds.
4. IF a payment gateway returns a failure response, THEN THE Payment_Gateway_Layer SHALL record the failed attempt and notify the student with an actionable error message.
5. THE SuperAdmin SHALL be able to enable or disable individual payment gateway integrations per tenant through the marketplace configuration.
6. THE Payment_Gateway_Layer SHALL log all transaction attempts with amount, gateway, status, and timestamp for audit purposes.

---

### Requirement 16: HR Management

**User Story:** As an HR Officer or SchoolAdmin, I want to manage the complete employee lifecycle including recruitment, contracts, leave, payroll, and performance reviews, so that all human resources operations are managed within the platform.

#### Acceptance Criteria

1. THE HR_System SHALL maintain employee records with personal details, employment type, contract start/end dates, department, role, and salary information.
2. THE HR_System SHALL support recruitment workflows: job posting, application tracking, shortlisting, interview scheduling, and offer letters.
3. THE HR_System SHALL support leave request and approval workflows with leave balance tracking per employee.
4. THE HR_System SHALL calculate payroll based on employee salary structure, deductions (PAYE, NHIF, NSSF per country framework), and allowances.
5. WHEN payroll is approved, THE HR_System SHALL generate payslips for all employees using the Document_Engine.
6. THE HR_System SHALL support performance review cycles with configurable appraisal forms and ratings.
7. THE HR_System SHALL support employee training records linking to LMS courses or external training events.
8. THE HR_System SHALL track staff attendance and integrate with leave balances for accurate payroll computation.

---

### Requirement 17: Procurement and ERP

**User Story:** As a Procurement Officer or SchoolAdmin, I want to manage purchase requests, vendor relationships, purchase orders, deliveries, and inventory, so that all institutional procurement is tracked and auditable.

#### Acceptance Criteria

1. THE Procurement_System SHALL support purchase request creation by any authorized staff member with approval workflow routing.
2. THE Procurement_System SHALL support vendor registration with contact details, product categories, and payment terms.
3. WHEN a purchase request is approved, THE Procurement_System SHALL allow creation of a Purchase Order sent to the selected vendor.
4. THE Procurement_System SHALL track deliveries against purchase orders, recording received quantities and discrepancies.
5. THE Procurement_System SHALL maintain an asset register with asset categories, acquisition dates, current values, and assigned locations.
6. THE Procurement_System SHALL support inventory management with stock levels, reorder thresholds, and stock movement logs.
7. IF a stock item falls below its reorder threshold, THEN THE Procurement_System SHALL generate a reorder alert to the Procurement Officer.

---

### Requirement 18: Library Management

**User Story:** As a Librarian or student, I want to manage physical and digital library resources including cataloging, borrowing, returns, and fines, so that the library operates efficiently and students have access to learning resources.

#### Acceptance Criteria

1. THE Library_System SHALL maintain a catalog of physical books with title, author, ISBN, category, copies available, and location.
2. THE Library_System SHALL support digital resources (eBooks, journals, research papers) accessible online from the student portal.
3. THE Library_System SHALL manage the borrowing lifecycle: request, approval, issue, return, and overdue tracking.
4. WHEN a borrowed book is not returned by the due date, THE Library_System SHALL calculate fines per configured daily rate and add them to the student's library account.
5. THE Library_System SHALL support reservation of books that are currently on loan, with automatic notification when the book becomes available.
6. THE Student_Library_Portal SHALL display each student's active loans, reservation queue, and outstanding fines.
7. THE Librarian_Dashboard SHALL show overdue items, daily loans, popular titles, and fine collection summaries.

---

### Requirement 19: Campus Life — Hostel Management

**User Story:** As a Hostel Manager or SchoolAdmin, I want to manage hostel blocks, rooms, bed allocations, occupancy, and visitor access, so that residential student accommodation is fully tracked.

#### Acceptance Criteria

1. THE Hostel_System SHALL support creation of hostel blocks, floors, rooms, and beds with capacity and gender designation.
2. THE Hostel_System SHALL support bed allocation to students for a given academic year with occupancy tracking.
3. THE Hostel_System SHALL maintain a visitor log recording visitor name, host student, check-in time, and check-out time.
4. WHEN a room reaches full occupancy, THE Hostel_System SHALL prevent further bed allocations for that room.
5. THE Hostel_System SHALL produce occupancy reports by block, floor, and room for the Hostel Manager.
6. THE SecurityOfficer_Dashboard SHALL have access to the visitor log for security monitoring.

---

### Requirement 20: Campus Life — Transport Management

**User Story:** As a Transport Manager, I want to manage institutional vehicles, drivers, routes, and GPS tracking, so that student and staff transport is safe and accountable.

#### Acceptance Criteria

1. THE Transport_System SHALL maintain a fleet register with vehicle details, registration, capacity, and assigned driver.
2. THE Transport_System SHALL support route creation with stops, estimated times, and fare rates.
3. THE Transport_System SHALL display a GPS tracking view showing current vehicle locations on a map.
4. THE Transport_System SHALL allow students to subscribe to transport routes with fare billing integration to the Finance_Engine.
5. THE Parent_Portal SHALL display the transport route and current vehicle location for parents of subscribed students.
6. WHEN a vehicle departs or arrives at a campus stop, THE Transport_System SHALL send a notification to subscribed parents.

---

### Requirement 21: Campus Life — Health Services

**User Story:** As a Health Officer or SchoolAdmin, I want to manage student and staff health records, medical visits, prescriptions, vaccinations, and emergency incidents, so that campus health services are documented and traceable.

#### Acceptance Criteria

1. THE Health_System SHALL maintain per-student medical records including blood type, allergies, chronic conditions, emergency contacts, and insurance details.
2. THE Health_System SHALL record medical visit logs with date, presenting complaint, diagnosis, treatment, and prescriptions.
3. THE Health_System SHALL track vaccination records per student with vaccine name, date, and next due date.
4. WHEN a medical emergency is recorded, THE Health_System SHALL trigger an emergency notification to the student's guardian and the SchoolAdmin.
5. THE Health_System SHALL support bulk health screening events with summary reports.

---

### Requirement 22: Website Builder and CMS

**User Story:** As a SchoolAdmin, I want an automatically generated institution website with a content management system, so that the institution has a professional public web presence without requiring web development skills.

#### Acceptance Criteria

1. THE Website_Builder SHALL auto-generate a public website for each tenant upon provisioning using the selected institution type template.
2. THE Website_Builder SHALL provide a CMS interface for SchoolAdmins to update the homepage, about page, news, events, gallery, and contact sections.
3. THE Website_Builder SHALL publish blog posts and news articles with SEO metadata (title, description, keywords).
4. THE Website_Builder SHALL display the institution's academic programs, fees, and contact information on the public website.
5. THE Website_Builder SHALL render the public website at the institution's configured domain path (e.g., `/school/{code}`).
6. THE Website_Builder SHALL support online admission inquiry forms linked to the Admissions_System.
7. WHEN a SchoolAdmin publishes a news article, THE Platform SHALL make it visible on the public website within 60 seconds.

---

### Requirement 23: Document Management Engine

**User Story:** As a SchoolAdmin or any authorized staff member, I want to generate, manage, and distribute official documents including admission letters, transcripts, certificates, report cards, and payslips, so that all institution documents follow a consistent template and can be produced on demand.

#### Acceptance Criteria

1. THE Document_Engine SHALL provide configurable templates for: admission letters, transcripts, certificates, report cards, payslips, and fee statements.
2. THE Document_Engine SHALL generate PDF documents populated with tenant-specific branding (logo, colors, institution name) and the relevant data.
3. THE Document_Engine SHALL support digital signature application on generated documents.
4. WHEN a student requests a transcript, THE Document_Engine SHALL generate it with all completed semester results and issue it with a document reference number.
5. THE Document_Engine SHALL maintain a document issuance log with document type, recipient, issuing officer, date, and reference number.
6. THE Document_Engine SHALL support bulk document generation (e.g., all report cards for a class group) as a batched operation.

---

### Requirement 24: Reporting and Analytics

**User Story:** As a SchoolAdmin, HOD, Dean, or Principal, I want role-appropriate analytics dashboards showing academic, financial, HR, attendance, and risk indicators, so that I can make informed management decisions.

#### Acceptance Criteria

1. THE Analytics_Engine SHALL provide an academic analytics dashboard showing enrollment trends, pass rates, GPA distributions, and unit failure rates.
2. THE Analytics_Engine SHALL provide a finance analytics dashboard showing revenue by fee category, collection rates, outstanding balances, and budget vs. actuals.
3. THE Analytics_Engine SHALL provide an HR analytics dashboard showing staff headcount, leave utilization, payroll summaries, and recruitment pipeline.
4. THE Analytics_Engine SHALL provide an attendance analytics dashboard showing class-level and student-level attendance rates with trend lines.
5. THE Analytics_Engine SHALL compute a student risk score based on attendance, grades, and fee payment status, flagging at-risk students for counselor review.
6. THE SuperAdmin_Dashboard SHALL provide a global analytics view showing aggregated metrics across all tenants including total students, revenue, and active institutions.
7. THE Analytics_Engine SHALL support data export to CSV and PDF for all reports.
8. WHILE a user is viewing an analytics dashboard, THE Analytics_Engine SHALL refresh data at configurable intervals without requiring a page reload.

---

### Requirement 25: Workflow Automation Engine

**User Story:** As a SchoolAdmin, I want to define trigger-action workflows that automate routine processes, so that common events like student admission, fee payment, and low attendance automatically trigger the appropriate notifications and actions.

#### Acceptance Criteria

1. THE Workflow_Engine SHALL support the following event triggers: `student_admitted`, `student_enrolled`, `fee_paid`, `attendance_low`, `exam_published`, `employee_hired`, `application_submitted`, and `graduation_approved`.
2. THE Workflow_Engine SHALL support the following action types: send_notification, create_record, enroll_in_channel, generate_document, update_status, and assign_role.
3. WHEN a triggering event fires, THE Workflow_Engine SHALL execute all enabled workflows matching that trigger within 10 seconds.
4. THE Workflow_Engine SHALL log every workflow execution with trigger event, matched workflow ID, actions executed, and success/failure status.
5. IF a workflow action fails, THEN THE Workflow_Engine SHALL place the failed action in the dead letter queue and notify the SchoolAdmin.
6. THE SchoolAdmin SHALL be able to create, enable, disable, and delete workflows through the Workflow_Engine UI.
7. THE Workflow_Engine SHALL support conditional logic allowing workflows to execute actions only when additional filter criteria are met (e.g., only for a specific program).

---

### Requirement 26: Marketplace (EduStore)

**User Story:** As a SchoolAdmin or SuperAdmin, I want to install optional add-on modules from a marketplace, so that each institution can extend its functionality without affecting other tenants.

#### Acceptance Criteria

1. THE Marketplace SHALL list available add-on modules: CBT, Hostel Extensions, Advanced Finance, CRM, Research Tools, and Extra LMS Modules.
2. WHEN a module is installed for a tenant, THE Platform SHALL activate the corresponding feature flags and UI sections for that tenant only.
3. WHEN a module is uninstalled, THE Platform SHALL deactivate the feature flags and preserve existing data without deletion.
4. THE SuperAdmin SHALL be able to manage the marketplace catalog, set pricing per module, and track installation counts.
5. THE Marketplace SHALL display a module's description, requirements, pricing, and installed tenant count.

---

### Requirement 27: Alumni Management System

**User Story:** As a graduate or Alumni Officer, I want to maintain an alumni directory, organize alumni events, track donations, and facilitate professional networking, so that the institution stays connected with its alumni community.

#### Acceptance Criteria

1. THE Alumni_System SHALL maintain an alumni directory where each record stores graduation year, program name, current employer, city/country location, primary email, and an optional LinkedIn profile URL; directory access SHALL be restricted to authenticated users (alumni, staff, admin) and SHALL NOT be publicly accessible without login.
2. WHEN a student's academic state transitions to `GRADUATED`, THE Alumni_System SHALL automatically create an alumni profile using the student's graduation year, program, and contact details, and SHALL send an account activation link to the student's registered email within 10 minutes of the transition; the activation link SHALL expire after 72 hours.
3. WHEN an Alumni Officer creates an event, THE Alumni_System SHALL store the event with a title, date, location, description, maximum capacity, and RSVP deadline; the RSVP status for each alumnus SHALL be one of: Not Responded, Attending, or Declined.
4. THE Alumni_System SHALL allow authenticated alumni and Alumni Officers to record donation pledges with donor name, amount, currency, campaign name, pledge date, and status (Pledged, Partially Paid, or Fulfilled).
5. THE Alumni_System SHALL provide a job board where authenticated alumni and verified employer accounts can post job listings with title, company, location, description, and application deadline; only alumni or employer-role users SHALL be able to create job posts.
6. THE Alumni_Dashboard SHALL display the authenticated alumni's own profile, a list of upcoming events with their current RSVP status, active job listings filtered to the alumnus's field of study, and a list of first-degree network connections from the same graduation cohort.
7. WHEN an authenticated alumnus submits a profile update, THE Alumni_System SHALL validate that the submitted email follows RFC 5322 format and that the employer name does not exceed 200 characters, then persist the changes within 5 seconds.

---

### Requirement 28: Research Management

**User Story:** As a Lecturer, Dean, or Registrar, I want to manage research projects, grant applications, thesis supervision, and publications tracking, so that institutional research output is systematically recorded and reportable.

#### Acceptance Criteria

1. THE Research_System SHALL support research project creation with title, principal investigator, co-investigators, funding source, start date, end date, and status.
2. THE Research_System SHALL support grant application tracking with funder name, amount applied, submission date, status, and awarded amount.
3. THE Research_System SHALL support thesis and dissertation registration linking a postgraduate student to a supervisor and tracking submission milestones.
4. WHEN a thesis milestone (proposal, first draft, final submission) is reached, THE Research_System SHALL notify the supervisor and Registrar.
5. THE Research_System SHALL maintain a publications registry with author, title, journal/conference, publication date, and DOI or URL.
6. THE Research_Portal SHALL display each lecturer's active research projects, supervised theses, and publication list.
7. THE Dean_Dashboard SHALL show faculty-level research metrics including total active projects, grants secured, and publications in the current year.

---

### Requirement 29: AI Layer — Predictions and Intelligence

**User Story:** As a SchoolAdmin, Counselor, or Lecturer, I want AI-powered predictions for student risk, dropout likelihood, attendance trends, and fee default probability, so that interventions can be made proactively before problems escalate.

#### Acceptance Criteria

1. THE AI_Engine SHALL compute a dropout risk score on a scale of 0–100 for each active student based on attendance rate, grade trends, fee payment status, and engagement metrics (defined as: access frequency, assignment submission rate, and login frequency over the preceding 30 days), updated at least once every 7 days.
2. THE AI_Engine SHALL compute a fee default risk score on a scale of 0–100 for each student with an outstanding balance, based on their payment history patterns, updated at least once every 7 days.
3. WHEN a student's dropout risk score exceeds the SchoolAdmin-configured threshold (valid range: 50–95), THE AI_Engine SHALL create an intervention flag displaying the student's name, risk score, and flag creation date, visible on the academic advisor's dashboard and the Counselor role dashboard.
4. THE AI_Engine SHALL provide timetable optimization suggestions identifying time slots where lecturer conflict rate exceeds 20% or classroom occupancy falls below 40%, and SHALL present at least one alternative slot for each flagged conflict.
5. WHEN a student requests the AI Study Assistant, THE AI_Engine SHALL respond to questions about the enrolled course content within 10 seconds, drawing from course materials linked to the student's active unit registrations.
6. WHEN a SchoolAdmin requests an AI-generated report for a dashboard section, THE AI_Engine SHALL produce a narrative summary of the underlying analytics data within 30 seconds and display it alongside the corresponding chart or table.
7. WHEN a student opens the academic advisor chatbot, THE AI_Engine SHALL suggest course registration options based on the student's completed units, program curriculum requirements, and current CGPA, within 15 seconds of the chatbot session opening.
8. THE AI_Engine SHALL generate attendance trend predictions per unit projecting whether attendance will fall below the SchoolAdmin-configured threshold (valid range: 50–90%) in the next 14 days, updated at least once every 7 days.
9. IF a student has fewer than 4 weeks of historical data, THEN THE AI_Engine SHALL exclude that student from dropout and fee default risk scoring and SHALL display a "Insufficient data" indicator on the student's risk profile rather than a score.

---

### Requirement 30: Country Frameworks

**User Story:** As a SuperAdmin or SchoolAdmin in a specific country, I want the platform to be pre-configured with that country's education structure, payroll tax rules, national exam frameworks, and regulatory reporting requirements, so that compliance is built in rather than bolted on.

#### Acceptance Criteria

1. THE Country_Framework SHALL include pre-configured education structures for: Kenya, Uganda, Tanzania, Rwanda, Nigeria, and South Africa.
2. WHEN a tenant selects a country during provisioning, THE Country_Framework SHALL load the corresponding education levels, grading scales, national curriculum standards, and term calendar structure.
3. THE Country_Framework SHALL configure payroll deduction rules per country: Kenya (PAYE, NHIF, NSSF, Housing Levy), Uganda (PAYE, NSSF), Tanzania (PAYE, NSSF), Rwanda (PAYE, CSR), Nigeria (PAYE, NHF, Pension), South Africa (PAYE, UIF, SDL).
4. THE Country_Framework SHALL support national examination integration for countries with centralized exams (e.g., KCSE for Kenya, UACE for Uganda).
5. THE Country_Framework SHALL generate regulatory compliance reports in the format required by the national education authority of the selected country.
6. THE SuperAdmin_Dashboard country sub-tab SHALL allow viewing and editing country framework configurations without code deployments.

---

### Requirement 31: Mobile Ecosystem

**User Story:** As a student, parent, lecturer, or school admin, I want a mobile-optimized experience with offline capability, push notifications, QR scanning, and role-specific mobile modes, so that I can use the platform effectively on a mobile device.

#### Acceptance Criteria

1. THE Mobile_Ecosystem SHALL provide distinct mobile-optimized views for each role: Student Mode, Parent Mode, Teacher Mode, School Admin Mode, and SuperAdmin Mode, each rendering only the navigation items and actions relevant to that role.
2. THE Mobile_Ecosystem SHALL support offline mode for students and lecturers, caching timetable data, up to 50 MB of course materials, and the last 30 days of attendance records for access without internet connectivity; cached data SHALL expire after 7 days.
3. WHEN internet connectivity is restored after offline use, THE Mobile_Ecosystem SHALL automatically sync all pending offline actions (attendance submissions, assignment uploads) to the server within 60 seconds of reconnection.
4. IF an offline sync fails after 3 retry attempts, THEN THE Mobile_Ecosystem SHALL notify the user that sync failed and queue the action for the next successful connection, without discarding the pending data.
5. THE Mobile_Ecosystem SHALL integrate push notification delivery for all notification types defined in the Communications_Hub.
6. THE Mobile_Ecosystem SHALL provide an in-app QR code scanner for student attendance marking; IF the QR scan fails to decode a valid session token, THEN THE Mobile_Ecosystem SHALL display an actionable error message offering the user the option to retry the scan or switch to PIN-based attendance.
7. THE Android_SDK SHALL provide a native Android wrapper exposing authentication, role-based dashboard routing, and push notification registration.
8. IF the user's device supports biometric authentication AND biometric has been enrolled on the device, THEN THE Mobile_Ecosystem SHALL offer biometric login (fingerprint or face recognition) as an alternative to password login, falling back to password login after 3 consecutive biometric failures.
9. WHEN authentication completes (biometric or password), THE Mobile_Ecosystem SHALL render the user's role-appropriate dashboard as the first visible screen within 2 seconds of the authentication confirmation.

---

### Requirement 32: Parent Portal

**User Story:** As a parent or guardian, I want to monitor my child's academic performance, attendance, fees, health, and transport status, so that I can stay informed and involved in my child's educational journey without contacting the school separately.

#### Acceptance Criteria

1. THE Parent_Portal SHALL display a summary dashboard showing each linked child's attendance rate, current GPA, outstanding fee balance, and upcoming assignments.
2. THE Parent_Portal SHALL allow parents to view their child's timetable, results, and attendance records.
3. THE Parent_Portal SHALL display the child's transport route and current vehicle location when transport subscription is active.
4. THE Parent_Portal SHALL show homework and assignment due dates for each linked child.
5. THE Parent_Portal SHALL allow parents to send messages to class teachers and school administrators through the Communications_Hub.
6. WHEN a school-wide announcement is published, THE Parent_Portal SHALL display it as a notification with the ability to acknowledge.
7. THE Parent_Portal SHALL display fee statements and allow parents to initiate fee payments on behalf of their children.

---

### Requirement 33: Sponsor Portal

**User Story:** As a sponsor or funding organization, I want to view the academic progress and financial disbursements for students I sponsor, so that I can verify that my support is being used effectively.

#### Acceptance Criteria

1. THE Sponsor_Portal SHALL display a list of all students linked to the sponsor's account.
2. THE Sponsor_Portal SHALL show each sponsored student's academic performance summary including GPA, attendance, and enrollment status.
3. THE Sponsor_Portal SHALL display fee disbursement records showing amounts paid, dates, and remaining balances for each sponsored student.
4. WHEN a sponsored student's academic performance drops below a configured threshold, THE Platform SHALL notify the sponsor.
5. THE Sponsor_Portal SHALL allow sponsors to download official academic progress reports for their sponsored students.

---

### Requirement 34: Production Hardening and Platform Integrity

**User Story:** As a SuperAdmin and Platform Engineer, I want the platform to be resilient, observable, and secure at production scale, so that tenant data is safe, operations are auditable, and failures are recoverable.

#### Acceptance Criteria

1. THE Platform SHALL implement tenant data isolation at the database query layer so that no query can return data belonging to a different `schoolId` than the authenticated user's.
2. THE Platform SHALL maintain a system-wide audit log capturing all create, update, and delete operations with actor ID, timestamp, entity type, entity ID, and before/after values.
3. THE Platform SHALL use an event queue with Write-Ahead Logging (WAL) to ensure no events are lost during system restarts or failures.
4. THE Platform SHALL support event replay for recovering from processing failures without data duplication.
5. THE Platform SHALL assign correlation IDs to all multi-step operations (sagas) enabling end-to-end tracing across services.
6. THE Platform SHALL implement a retry engine with exponential back-off for transient failures in workflow actions, payment callbacks, and notification delivery.
7. IF a workflow action or notification delivery fails after the maximum retry count, THEN THE Platform SHALL place the item in a dead letter queue and alert the SuperAdmin.
8. THE Platform SHALL take periodic system snapshots enabling point-in-time recovery.
9. THE Platform SHALL enforce RBAC permission checks at both the API route level and the data access layer.
10. THE SuperAdmin_Dashboard SHALL provide a real-time system health view showing API response times, error rates, queue depths, and active tenant counts.
11. THE Platform SHALL implement security policies including rate limiting on authentication endpoints, brute force protection, and session expiry.
12. THE Platform SHALL support HTTPS-only operation with TLS 1.2 or higher enforced across all endpoints.
