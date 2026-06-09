/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface School {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  disabled: boolean;
  enabledModules?: Record<string, boolean>;
}

export type UserRole = 'superadmin' | 'admin' | 'staff' | 'student';

export interface User {
  id: string;
  role: UserRole;
  email: string;
  passwordHash: string; // Plaintext or basic hash for sample system
  name: string;
  phone?: string;
  schoolId?: string; // Null for superadmin
}

export interface Department {
  id: string;
  schoolId: string;
  name: string;
}

export interface Program {
  id: string;
  schoolId: string;
  departmentId?: string;
  name: string;
  code?: string;
  capacity?: number;
}

export interface Unit {
  id: string;
  schoolId: string;
  departmentId?: string;
  programId?: string;
  code: string;
  name: string;
}

export interface Staff {
  id: string;
  schoolId: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  role: 'Dean' | 'HOD' | 'Lecturer' | 'Registrar';
  departmentId?: string;
}

export interface Student {
  id: string;
  schoolId: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  regNumber: string;
  programId?: string;
  departmentId?: string;
  academicYearId?: string;
  levelId?: string;
  gender?: string;
  dob?: string;
  yearOfStudy: number;
  status: 'active' | 'suspended' | 'Active' | 'Deferred' | 'Suspended' | 'Graduated';
  currentLevel?: string;
  currentSemester?: string;
  intakeId?: string;
  programName?: string;
  departmentName?: string;
  academicYearName?: string;
  levelName?: string;
  academicState?: 'ADMITTED' | 'ACTIVE' | 'EXAM_READY' | 'GRADUATING' | 'GRADUATED';
  identityId?: string;
}

export interface Intake {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  month: string;
  year: number;
  status: 'active' | 'disabled';
}

export interface AcademicYear {
  id: string;
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'closed' | 'upcoming';
}

export interface Semester {
  id: string;
  schoolId: string;
  academicYearId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'closed' | 'upcoming';
  academicYearName?: string;
}

export interface Level {
  id: string;
  schoolId: string;
  name: string;
  order: number;
}

export interface ProgramCurriculum {
  id: string;
  schoolId: string;
  programId: string;
  levelId: string;
  semesterId: string;
  unitId: string;
  unitType: 'Core' | 'Elective';
  programName?: string;
  levelName?: string;
  semesterName?: string;
  unitName?: string;
  unitCode?: string;
}

export interface ClassGroup {
  id: string;
  schoolId: string;
  programId: string;
  levelId: string;
  groupName: string;
  capacity: number;
  programName?: string;
  levelName?: string;
}

export interface TeachingAssignment {
  id: string;
  schoolId: string;
  staffId: string;
  academicYearId: string;
  semesterId: string;
  unitId: string;
  staffName?: string;
  unitName?: string;
  unitCode?: string;
  semesterName?: string;
  academicYearName?: string;
}

export interface Timetable {
  id: string;
  schoolId: string;
  academicYearId: string;
  semesterId: string;
  classGroupId: string;
  unitId: string;
  staffId: string;
  venue: string;
  day: string;
  timeSlot: string;
  academicYearName?: string;
  semesterName?: string;
  classGroupName?: string;
  unitName?: string;
  unitCode?: string;
  staffName?: string;
}

export interface CourseRegistration {
  id: string;
  schoolId: string;
  studentId: string;
  academicYearId: string;
  semesterId: string;
  unitId: string;
  registrationDate: string;
  grade: string;
  attendanceCount?: number;
  totalClasses?: number;
  studentName?: string;
  studentReg?: string;
  unitName?: string;
  unitCode?: string;
  semesterName?: string;
  academicYearName?: string;
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: number;
}

export interface GlobalIdentity {
  id: string;
  fullName: string;
  primaryEmail: string;
  phone?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface DeviceBinding {
  id: string;
  identityId: string;
  deviceId: string;
  deviceName: string;
  isBound: boolean;
  bondedAt: string;
  lastSeen: string;
}

export interface SystemEvent {
  id: string;
  eventType: string;
  title: string;
  message: string;
  schoolId?: string;
  timestamp: string;
  metadata?: any;
}

export interface StateTransition {
  id: string;
  studentId: string;
  schoolId: string;
  fromState: string;
  toState: string;
  triggeredBy: string;
  reason: string;
  timestamp: string;
  studentName?: string;
  studentReg?: string;
}

export interface UosConfig {
  key: string;
  value: any;
  title: string;
}

export interface FeatureFlag {
  key: string;
  value: boolean;
  title: string;
}

export interface WorkflowAction {
  type: string;
  params: any;
}

export interface WorkflowTrigger {
  type: string;
  condition: any;
}

export interface Workflow {
  id: string;
  schoolId: string;
  name: string;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  enabled: boolean;
}
