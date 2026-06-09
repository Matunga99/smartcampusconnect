export const INSTITUTION_TEMPLATES = {
  'Lower Primary School': {
    institutionType: 'Lower Primary School',
    name: 'Lower Primary School Template',
    terminology: {
      faculty: 'School Wing',
      department: 'Age Group',
      program: 'Grade Level',
      cohort: 'Section',
      unit: 'Subject',
      lecturer: 'Teacher',
      student: 'Pupil',
      semester: 'Term',
      academicYear: 'School Year'
    },
    hierarchy: ['School', 'Grade']
  },
  'Primary School': {
    institutionType: 'Primary School',
    name: 'Primary School Template',
    terminology: {
      faculty: 'School Section',
      department: 'Department',
      program: 'Class Level',
      cohort: 'Section',
      unit: 'Subject',
      lecturer: 'Teacher',
      student: 'Pupil',
      semester: 'Term',
      academicYear: 'School Year'
    },
    hierarchy: ['School', 'Grade']
  },
  'Secondary School': {
    institutionType: 'Secondary School',
    name: 'Secondary School Template',
    terminology: {
      faculty: 'Academic Department',
      department: 'Subject Group',
      program: 'Form Level',
      cohort: 'Stream',
      unit: 'Subject',
      lecturer: 'Teacher',
      student: 'Student',
      semester: 'Term',
      academicYear: 'School Year'
    },
    hierarchy: ['School', 'Class', 'Stream']
  },
  'TVET Institution': {
    institutionType: 'TVET Institution',
    name: 'TVET Institution Template',
    terminology: {
      faculty: 'School of Study',
      department: 'Section',
      program: 'Trade Course',
      cohort: 'Intake',
      unit: 'Module',
      lecturer: 'Trainer',
      student: 'Trainee',
      semester: 'Term',
      academicYear: 'Academic Year'
    },
    hierarchy: ['School', 'Department', 'Course']
  },
  'College': {
    institutionType: 'College',
    name: 'College Template',
    terminology: {
      faculty: 'School',
      department: 'Department',
      program: 'Diploma/Certificate Course',
      cohort: 'Cohort',
      unit: 'Unit',
      lecturer: 'Tutor',
      student: 'Student',
      semester: 'Semester',
      academicYear: 'Academic Year'
    },
    hierarchy: ['School', 'Department', 'Program', 'Unit']
  },
  'University': {
    institutionType: 'University',
    name: 'University Configuration (Master Template)',
    terminology: {
      faculty: 'Faculty',
      department: 'Department',
      program: 'Program',
      cohort: 'Cohort',
      unit: 'Unit',
      lecturer: 'Lecturer',
      student: 'Student',
      semester: 'Semester',
      academicYear: 'Academic Year'
    },
    hierarchy: ['University', 'Faculty', 'Department', 'Program', 'Cohort', 'Unit']
  },
  'Training Center': {
    institutionType: 'Training Center',
    name: 'Professional Training Center Template',
    terminology: {
      faculty: 'Division',
      department: 'Section',
      program: 'Short Course',
      cohort: 'Cohort',
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
    terminology: {
      faculty: 'Academy Wing',
      department: 'Learning Track',
      program: 'Learning Path',
      cohort: 'Cohort',
      unit: 'Topic',
      lecturer: 'Facilitator',
      student: 'Employee / Learner',
      semester: 'Quarter',
      academicYear: 'Operating Year'
    }
  }
};

export function resolveTemplate(institutionType: string) {
    const template = (INSTITUTION_TEMPLATES as any)[institutionType];
    if (!template) {
        throw new Error(`Invalid institution type: ${institutionType} - NO FALLBACK ALLOWED`);
    }
    return template;
}

export function generateUIMap(template: any) {
    return template.terminology || {};
}
