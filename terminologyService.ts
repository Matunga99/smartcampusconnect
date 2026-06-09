import { INSTITUTION_TEMPLATES } from './src/lib/templates';

const DEFAULT_TERMINOLOGY = {
    faculty: 'Faculty',
    department: 'Department',
    program: 'Program',
    cohort: 'Cohort',
    unit: 'Unit',
    lecturer: 'Lecturer',
    student: 'Student',
    semester: 'Semester',
    academicYear: 'Academic Year'
};

export function getTerminologyMap(schoolId: string, db: any) {
    const school = db.schools.find((s: any) => s.id === schoolId);
    if (!school) return DEFAULT_TERMINOLOGY;
    
    const template = INSTITUTION_TEMPLATES[school.institutionType];
    return template?.terminology || DEFAULT_TERMINOLOGY;
}

export function getTerm(schoolId: string, db: any, internalKey: string) {
    const map: any = getTerminologyMap(schoolId, db);
    return map[internalKey.toLowerCase()] || internalKey;
}

export function resolveInstitutionVocabulary(institutionType: string) {
    const template = INSTITUTION_TEMPLATES[institutionType];
    return template?.terminology || DEFAULT_TERMINOLOGY;
}
