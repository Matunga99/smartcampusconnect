/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TemplateConfig {
  institutionType: string;
  name: string;
  modules: {
    academicPeriods: boolean; // terms/semesters config
    curriculumMapping: boolean; // levels/curriculum mapping
    courseRegistration: boolean; // students course registration
    lecturerAllocation: boolean; // lecturer teaching allocation
    classGroups: boolean; // class groups support
    timetableEngine: boolean; // timetable scheduling
    libraries: boolean; // library, books, borrowings
    researchPublications: boolean; // research, thesis, publications
    hostels: boolean; // student accommodation & hostels
    transport: boolean; // student transport & vehicles
    welfareSupport: boolean; // student welfare counseling
    hrPayroll: boolean; // HR employee payroll, leave balances
    procurementInventory: boolean; // suppliers purchase requests
  };
  terminology: {
    faculty: string;
    department: string;
    program: string;
    unit: string;
    lecturer: string;
    student: string;
    semester: string;
    academicYear: string;
  };
}

export const INSTITUTION_TEMPLATES: Record<string, TemplateConfig> = {
  'Lower Primary School': {
    institutionType: 'Lower Primary School',
    name: 'Lower Primary School Template',
    modules: {
      academicPeriods: true,
      curriculumMapping: true,
      courseRegistration: false,
      lecturerAllocation: true,
      classGroups: true,
      timetableEngine: true,
      libraries: false,
      researchPublications: false,
      hostels: false,
      transport: true,
      welfareSupport: true,
      hrPayroll: true,
      procurementInventory: false
    },
    terminology: {
      faculty: 'School Wing',
      department: 'Age Group',
      program: 'Grade Level',
      unit: 'Subject',
      lecturer: 'Teacher',
      student: 'Pupil',
      semester: 'Term',
      academicYear: 'School Year'
    }
  },
  'Primary School': {
    institutionType: 'Primary School',
    name: 'Primary School Template',
    modules: {
      academicPeriods: true,
      curriculumMapping: true,
      courseRegistration: false,
      lecturerAllocation: true,
      classGroups: true,
      timetableEngine: true,
      libraries: true,
      researchPublications: false,
      hostels: false,
      transport: true,
      welfareSupport: true,
      hrPayroll: true,
      procurementInventory: true
    },
    terminology: {
      faculty: 'School Section',
      department: 'Department',
      program: 'Class Level',
      unit: 'Subject',
      lecturer: 'Teacher',
      student: 'Pupil',
      semester: 'Term',
      academicYear: 'School Year'
    }
  },
  'Secondary School': {
    institutionType: 'Secondary School',
    name: 'Secondary School Template',
    modules: {
      academicPeriods: true,
      curriculumMapping: true,
      courseRegistration: true,
      lecturerAllocation: true,
      classGroups: true,
      timetableEngine: true,
      libraries: true,
      researchPublications: false,
      hostels: true,
      transport: true,
      welfareSupport: true,
      hrPayroll: true,
      procurementInventory: true
    },
    terminology: {
      faculty: 'Academic Department',
      department: 'Subject Group',
      program: 'Form Level',
      unit: 'Subject',
      lecturer: 'Teacher',
      student: 'Student',
      semester: 'Term',
      academicYear: 'School Year'
    }
  },
  'TVET Institution': {
    institutionType: 'TVET Institution',
    name: 'TVET Institution Template',
    modules: {
      academicPeriods: true,
      curriculumMapping: true,
      courseRegistration: true,
      lecturerAllocation: true,
      classGroups: true,
      timetableEngine: true,
      libraries: true,
      researchPublications: false,
      hostels: true,
      transport: true,
      welfareSupport: true,
      hrPayroll: true,
      procurementInventory: true
    },
    terminology: {
      faculty: 'School of Study',
      department: 'Section',
      program: 'Trade Course',
      unit: 'Module',
      lecturer: 'Trainer',
      student: 'Trainee',
      semester: 'Term',
      academicYear: 'Academic Year'
    }
  },
  'College': {
    institutionType: 'College',
    name: 'College Template',
    modules: {
      academicPeriods: true,
      curriculumMapping: true,
      courseRegistration: true,
      lecturerAllocation: true,
      classGroups: true,
      timetableEngine: true,
      libraries: true,
      researchPublications: false,
      hostels: true,
      transport: true,
      welfareSupport: true,
      hrPayroll: true,
      procurementInventory: true
    },
    terminology: {
      faculty: 'School',
      department: 'Department',
      program: 'Diploma/Certificate Course',
      unit: 'Unit',
      lecturer: 'Tutor',
      student: 'Student',
      semester: 'Semester',
      academicYear: 'Academic Year'
    }
  },
  'University': {
    institutionType: 'University',
    name: 'University Configuration (Master Template)',
    modules: {
      academicPeriods: true,
      curriculumMapping: true,
      courseRegistration: true,
      lecturerAllocation: true,
      classGroups: true,
      timetableEngine: true,
      libraries: true,
      researchPublications: true,
      hostels: true,
      transport: true,
      welfareSupport: true,
      hrPayroll: true,
      procurementInventory: true
    },
    terminology: {
      faculty: 'Faculty',
      department: 'Department',
      program: 'Program',
      unit: 'Unit',
      lecturer: 'Lecturer',
      student: 'Student',
      semester: 'Semester',
      academicYear: 'Academic Year'
    }
  },
  'Training Center': {
    institutionType: 'Training Center',
    name: 'Professional Training Center Template',
    modules: {
      academicPeriods: true,
      curriculumMapping: true,
      courseRegistration: true,
      lecturerAllocation: true,
      classGroups: true,
      timetableEngine: true,
      libraries: false,
      researchPublications: false,
      hostels: false,
      transport: false,
      welfareSupport: false,
      hrPayroll: true,
      procurementInventory: true
    },
    terminology: {
      faculty: 'Division',
      department: 'Section',
      program: 'Short Course',
      unit: 'Topic / Session',
      lecturer: 'Instructor',
      student: 'Participant',
      semester: 'Cycle',
      academicYear: 'Year'
    }
  },
  'Corporate Academy': {
    institutionType: 'Corporate Academy',
    name: 'Corporate Academy Template',
    modules: {
      academicPeriods: true,
      curriculumMapping: true,
      courseRegistration: true,
      lecturerAllocation: true,
      classGroups: true,
      timetableEngine: false,
      libraries: false,
      researchPublications: false,
      hostels: false,
      transport: false,
      welfareSupport: false,
      hrPayroll: true,
      procurementInventory: false
    },
    terminology: {
      faculty: 'Academy Wing',
      department: 'Learning Track',
      program: 'Learning Path',
      unit: 'Module',
      lecturer: 'Facilitator',
      student: 'Employee / Learner',
      semester: 'Quarter',
      academicYear: 'Operating Year'
    }
  }
};
