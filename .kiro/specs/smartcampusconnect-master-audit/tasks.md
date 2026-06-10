# Implementation Tasks

## SmartCampusConnect X — Master Feature Completion

- [ ] 1. Extend UserRole type and data models
  - Add all 21 roles to UserRole union in src/types.ts
  - Add Application, AlumniProfile, AlumniEvent, AlumniDonation, AlumniJobPost interfaces
  - Add AIRiskScore, DisciplineRecord, MedicalRecord, StudentTransfer interfaces
  - Add CountryFramework interface
  - _Requirements: 3.1, 4, 5, 6, 27, 29, 30_

- [ ] 2. Seed db.json with new collections and demo data
  - Add applications, alumniProfiles, alumniEvents, alumniDonations, alumniJobs collections
  - Add aiRiskScores, disciplineRecords, medicalRecords, studentTransfers collections
  - Add countryFrameworks collection with Kenya, Uganda, Tanzania, Rwanda, Nigeria, South Africa
  - Add demo users for registrar, bursar, hod, dean, principal, boardmember, alumni, securityofficer roles
  - _Requirements: 3, 4, 5, 6, 27, 29, 30_

- [ ] 3. Add Admissions API routes to server.ts
  - POST /api/admissions/apply (public)
  - GET /api/admissions (admin, registrar)
  - PUT /api/admissions/:id/advance (admin, registrar)
  - POST /api/admissions/:id/enroll — creates student record, fires workflow event
  - GET /api/admissions/stats — funnel metrics
  - _Requirements: 5.1–5.13_

- [ ] 4. Add Alumni API routes to server.ts
  - GET/POST /api/alumni (profiles)
  - PUT /api/alumni/:id (self-update)
  - GET/POST /api/alumni/events
  - POST /api/alumni/events/:id/rsvp
  - GET/POST /api/alumni/jobs
  - GET/POST /api/alumni/donations
  - _Requirements: 27.1–27.7_

- [ ] 5. Add AI Engine API routes to server.ts
  - POST /api/ai/compute-risks — compute dropout + fee default scores
  - GET /api/ai/risks — list scores with intervention flags
  - GET /api/ai/timetable-suggestions
  - POST /api/ai/study-assistant — chat endpoint
  - POST /api/ai/advisor — course recommendation endpoint
  - GET /api/ai/attendance-predictions
  - _Requirements: 29.1–29.9_

- [ ] 6. Add SIS extension API routes to server.ts
  - GET/POST /api/sis/:studentId/medical
  - GET/POST /api/sis/:studentId/discipline
  - GET/POST /api/sis/:studentId/transfers
  - PUT /api/students/:id/promote
  - PUT /api/students/:id/graduate
  - _Requirements: 6.1–6.10_

- [ ] 7. Add Country Framework API routes to server.ts
  - GET /api/country-frameworks
  - GET /api/country-frameworks/:code
  - PUT /api/country-frameworks/:code
  - _Requirements: 30.1–30.6_

- [ ] 8. Create src/lib/countryFrameworks.ts
  - Define CountryFrameworkMap with all 6 countries
  - Kenya: CBC structure, KCSE, PAYE/NHIF/NSSF/Housing Levy rules
  - Uganda: O-Level/A-Level, UACE, PAYE/NSSF rules
  - Tanzania: CSEE, PAYE/NSSF rules
  - Rwanda: REB structure, PAYE/CSR rules
  - Nigeria: WAEC/NECO, PAYE/NHF/Pension rules
  - South Africa: NSC/Matric, PAYE/UIF/SDL rules
  - _Requirements: 30.1–30.6_

- [ ] 9. Create src/lib/aiEngine.ts
  - computeDropoutRisk(studentId, schoolId) — weighted score from attendance, grades, fees, logins
  - computeFeeDefaultRisk(studentId, schoolId) — payment history pattern scoring
  - getAttendancePredictions(schoolId) — per-unit 14-day trend forecast
  - getTimetableSuggestions(schoolId) — conflict rate and utilization analysis
  - generateStudyAssistantResponse(query, studentId) — rule-based content lookup
  - generateAdvisorRecommendations(studentId) — curriculum gap analysis
  - _Requirements: 29.1–29.9_

- [ ] 10. Create src/lib/admissionsEngine.ts
  - generateRefNumber(schoolId, programId) — unique reference number
  - validateTransition(from, to) — enforce valid status sequence
  - autoCloseExpiredIntakes() — deadline enforcement
  - advanceWaitlist(applicationId) — next-rank advancement
  - convertToStudent(applicationId) — enrollment logic
  - _Requirements: 5.1–5.13_

- [ ] 11. Create src/components/AdminAdmissionsEngine.tsx
  - Applications list tab with status badges, search, filter by program/status
  - Funnel metrics dashboard (total, by status, conversion rate)
  - Application detail modal: documents viewer, stage advance controls, entrance exam score
  - Intake configuration tab: capacity, dates, required documents per program
  - Enrollment tab: admitted applicants ready for conversion to students
  - _Requirements: 5.1–5.13_

- [ ] 12. Create src/components/AdminAlumniManagement.tsx
  - Alumni directory tab with search, export CSV
  - Events management tab: create/edit/delete events, view RSVPs
  - Donations tab: campaigns, pledge list, status tracking
  - Job board admin tab: review and approve job postings
  - _Requirements: 27.1–27.7_

- [ ] 13. Create src/components/AlumniDashboard.tsx
  - Profile tab: view own alumni record, edit employer/location/LinkedIn
  - Events tab: upcoming events with RSVP (Attending/Declined) controls
  - Jobs tab: job board filtered by graduation program field
  - Network tab: cohort connections from same graduation year
  - _Requirements: 27.6, 4.9_

- [ ] 14. Create src/components/AdminAIEngine.tsx
  - Risk Dashboard tab: sortable table of students with dropout + fee default scores, intervention flag toggle
  - Attendance Predictions tab: per-unit bar chart showing projected attendance vs threshold
  - Timetable Suggestions tab: list of conflict/utilization issues with alternative slot suggestions
  - AI Reports tab: generate narrative summary button per analytics section
  - _Requirements: 29.1–29.9_

- [ ] 15. Create src/components/RegistrarDashboard.tsx
  - KPI cards: pending applications, enrolled this semester, transcripts issued
  - Admissions queue panel: application list with quick-advance controls
  - Enrollment records panel: student list with academic state indicators
  - Academic records panel: transcript generation, state transition log
  - Communications shortcut to CommunicationsHub
  - _Requirements: 4.1_

- [ ] 16. Create src/components/BursarDashboard.tsx
  - KPI cards: today's collections, total outstanding, scholarships active
  - Daily receipts panel: payment list for today with gateway breakdown
  - Outstanding balances panel: students with unpaid fees, overdue alerts
  - Payment plans panel: active installment schedules
  - Fee statement generation button per student
  - _Requirements: 4.2_

- [ ] 17. Create src/components/HODDashboard.tsx
  - KPI cards: staff count, units this semester, average dept GPA, attendance rate
  - Dept staff panel: list of lecturers in department with unit allocations
  - Dept timetable panel: weekly grid filtered to department units
  - Student performance panel: GPA distribution chart for dept students
  - Leave approval queue for dept staff
  - _Requirements: 4.3_

- [ ] 18. Create src/components/DeanDashboard.tsx
  - KPI cards: programs count, active research projects, publications this year
  - Faculty programs panel: program enrollment and pass rate summary
  - Research projects panel: active projects with PI names and status
  - Faculty analytics: GPA trend by program, enrollment trend
  - Approve/review research project actions
  - _Requirements: 4.4_

- [ ] 19. Create src/components/PrincipalDashboard.tsx
  - KPI banner: total enrollment, overall attendance %, avg GPA, outstanding fees total
  - Staff summary panel: headcount by role, attendance today
  - Student summary panel: enrollment by program, at-risk count
  - Finance summary panel: this month collections vs budget
  - Announcements panel: last 3 announcements + publish new announcement
  - _Requirements: 4.5_

- [ ] 20. Create src/components/DeputyPrincipalDashboard.tsx
  - KPI cards: staff present today, open discipline cases, academic calendar status
  - Staff attendance panel: today's staff check-in list
  - Discipline records panel: open cases with actions (resolve, escalate)
  - Academic operations panel: current term progress, upcoming exams
  - _Requirements: 4.6_

- [ ] 21. Create src/components/BoardMemberDashboard.tsx
  - Read-only executive summary layout (no create/edit/delete controls)
  - Finance panel: revenue vs budget, fee collection rate, expenditure breakdown
  - Enrollment panel: total students, enrollment trend chart, retention rate
  - Academic performance panel: pass rate by program, GPA distribution
  - Compliance panel: regulatory submissions status, audit findings
  - Export to PDF button for each panel
  - _Requirements: 4.7_

- [ ] 22. Create src/components/SecurityOfficerDashboard.tsx
  - KPI cards: visitors today, open incidents, hostel occupancy
  - Visitor log panel: log new visitor (name, host student, check-in), check-out action
  - Hostel access panel: current occupancy list, bed allocation status
  - Incidents panel: record new incident, list of open incidents with status
  - _Requirements: 4.8_

- [ ] 23. Update src/types.ts — complete UserRole and new interfaces
  - _Requirements: 3.1_

- [ ] 24. Update src/App.tsx — add all new role routes
  - Import all 9 new dashboard components
  - Add routing cases for: registrar, bursar, hod, dean, principal, deputyprincipal, boardmember, securityofficer, alumni, librarian, hostelmanager, transportmanager, hrofficer, procurementofficer, accountant
  - Add loading state during role resolution
  - Ensure unknown roles render "Portal coming soon" screen with role label
  - _Requirements: 4.1–4.11_

- [ ] 25. Update SchoolAdminDashboard.tsx — add Admissions and Alumni tabs
  - Import AdminAdmissionsEngine and AdminAlumniManagement
  - Add 'admissions' and 'alumni' to activeTab type
  - Add sidebar nav items for both with appropriate icons
  - Gate Admissions tab behind admissions module flag
  - _Requirements: 5, 27_

- [ ] 26. Update SchoolAdminDashboard.tsx — add AI Engine tab
  - Import AdminAIEngine component
  - Add 'ai_engine' to activeTab type
  - Add sidebar nav item with Sparkles/Brain icon
  - Gate behind ai module flag
  - _Requirements: 29_

- [ ] 27. Update SuperAdminDashboard.tsx — wire Country Frameworks in architecture tab
  - Import countryFrameworks data from src/lib/countryFrameworks.ts
  - Render country sub-tab with 6-country config viewer
  - Show education levels, term structure, payroll rules, national exams per country
  - Allow SuperAdmin to edit payroll rule values inline
  - _Requirements: 30_

- [ ] 28. Update ParentDashboard.tsx — add Transport and Homework tabs
  - Add 'transport' sub-tab: show child's subscribed route, stops list, vehicle status indicator
  - Add 'homework' sub-tab: fetch child's pending assignments from course registrations, show due dates
  - _Requirements: 6 (parent linking), 32.3, 32.4_

- [ ] 29. Update StudentDashboard.tsx — embed AI Study Assistant and Academic Advisor
  - Add AI chat widget in dashboard overview panel (collapsible)
  - In registration tab, add "Get AI Advice" button that calls /api/ai/advisor and shows recommendations
  - _Requirements: 29.5, 29.7_

- [ ] 30. Update SchoolAdminDashboard.tsx students tab — add SIS extensions
  - Extend student detail modal/panel with Medical Records sub-tab
  - Add Discipline Records sub-tab
  - Add Transfers sub-tab
  - Add Promote and Graduate action buttons with confirmation dialogs
  - _Requirements: 6.1–6.10_

- [ ] 31. Verify and test all role logins end-to-end
  - Confirm each new demo user in db.json logs in and reaches correct dashboard
  - Confirm schoolId isolation: data only shows for correct tenant
  - Confirm BoardMember sees no create/edit/delete controls
  - Confirm HOD only sees their department's data
  - _Requirements: 3, 4_
