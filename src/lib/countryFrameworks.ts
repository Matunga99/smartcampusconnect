/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { CountryFramework } from '../types';

export const COUNTRY_FRAMEWORKS: Record<string, CountryFramework> = {
  KE: {
    code: 'KE',
    name: 'Kenya',
    currency: 'KES',
    educationLevels: [
      'Pre-Primary 1', 'Pre-Primary 2',
      'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
      'Grade 7', 'Grade 8', 'Grade 9',
      'Grade 10', 'Grade 11', 'Grade 12',
      'Certificate', 'Diploma', 'Bachelor', 'Postgraduate Diploma', 'Masters', 'PhD'
    ],
    termStructure: '3 Terms',
    gradingScale: 'A (80-100), B (70-79), C (60-69), D (50-59), E (<50)',
    nationalExams: ['KCPE (Grade 6)', 'KCSE (Grade 12)', 'KNEC Craft Certificates', 'KNEC Diploma'],
    payrollDeductions: [
      { name: 'PAYE', type: 'percentage', rate: 30, employeeShare: true, employerShare: false },
      { name: 'NHIF', type: 'fixed', rate: 1700, employeeShare: true, employerShare: false },
      { name: 'NSSF (Tier I)', type: 'fixed', rate: 360, employeeShare: true, employerShare: true },
      { name: 'NSSF (Tier II)', type: 'percentage', rate: 6, cap: 1080, employeeShare: true, employerShare: true },
      { name: 'Housing Levy', type: 'percentage', rate: 1.5, employeeShare: true, employerShare: true },
      { name: 'SHIF', type: 'percentage', rate: 2.75, employeeShare: true, employerShare: false },
    ],
    regulatoryAuthority: 'Ministry of Education (MOE) / Kenya National Examinations Council (KNEC)'
  },
  UG: {
    code: 'UG',
    name: 'Uganda',
    currency: 'UGX',
    educationLevels: [
      'Nursery', 'Primary 1–7',
      'S1', 'S2', 'S3', 'S4 (UCE)',
      'S5', 'S6 (UACE)',
      'Certificate', 'Diploma', 'Bachelor', 'Masters', 'PhD'
    ],
    termStructure: '3 Terms',
    gradingScale: 'D1-D2 (Distinction), C3-C4 (Credit), P5-P6 (Pass), F7-F9 (Fail)',
    nationalExams: ['PLE (Primary Leaving)', 'UCE (O-Level)', 'UACE (A-Level)', 'UNEB Business Exams'],
    payrollDeductions: [
      { name: 'PAYE', type: 'percentage', rate: 40, employeeShare: true, employerShare: false },
      { name: 'NSSF', type: 'percentage', rate: 5, employeeShare: true, employerShare: false },
      { name: 'NSSF (Employer)', type: 'percentage', rate: 10, employeeShare: false, employerShare: true },
    ],
    regulatoryAuthority: 'Ministry of Education and Sports / Uganda National Examinations Board (UNEB)'
  },
  TZ: {
    code: 'TZ',
    name: 'Tanzania',
    currency: 'TZS',
    educationLevels: [
      'Standard 1–7 (Primary)',
      'Form 1–4 (O-Level, CSEE)',
      'Form 5–6 (A-Level, ACSEE)',
      'Certificate', 'Diploma', 'Bachelor', 'Masters', 'PhD'
    ],
    termStructure: '3 Terms',
    gradingScale: 'A (75-100), B (65-74), C (50-64), D (30-49), F (<30)',
    nationalExams: ['PSLE (Standard 7)', 'CSEE (Form 4)', 'ACSEE (Form 6)', 'NACTE Certificate/Diploma'],
    payrollDeductions: [
      { name: 'PAYE', type: 'percentage', rate: 30, employeeShare: true, employerShare: false },
      { name: 'NSSF', type: 'percentage', rate: 10, employeeShare: true, employerShare: true },
      { name: 'SDL', type: 'percentage', rate: 4, employeeShare: false, employerShare: true },
      { name: 'NHIF', type: 'percentage', rate: 3, employeeShare: true, employerShare: true },
    ],
    regulatoryAuthority: 'Ministry of Education / NECTA / NACTE'
  },
  RW: {
    code: 'RW',
    name: 'Rwanda',
    currency: 'RWF',
    educationLevels: [
      'Nursery & Pre-Primary',
      'P1–P6 (Primary)',
      'S1–S3 (Lower Secondary)',
      'S4–S6 (Upper Secondary, NSC)',
      'Certificate', 'Advanced Diploma', 'Bachelor', 'Masters', 'PhD'
    ],
    termStructure: '3 Terms',
    gradingScale: 'A (80-100), B (70-79), C (60-69), D (50-59), E (<50)',
    nationalExams: ['PLE (P6)', 'NSC (S3)', 'A-Level (S6)', 'TVET National Assessment'],
    payrollDeductions: [
      { name: 'PAYE', type: 'percentage', rate: 30, employeeShare: true, employerShare: false },
      { name: 'CSR (Employee)', type: 'percentage', rate: 3, employeeShare: true, employerShare: false },
      { name: 'CSR (Employer)', type: 'percentage', rate: 5, employeeShare: false, employerShare: true },
      { name: 'RAMA Medical', type: 'percentage', rate: 7.5, employeeShare: true, employerShare: true },
    ],
    regulatoryAuthority: 'Rwanda Education Board (REB) / Higher Education Council (HEC)'
  },
  NG: {
    code: 'NG',
    name: 'Nigeria',
    currency: 'NGN',
    educationLevels: [
      'Nursery 1–2', 'Primary 1–6',
      'JSS 1–3 (BECE)',
      'SSS 1–3 (WAEC/NECO)',
      'ND (National Diploma)', 'HND (Higher National Diploma)',
      'Bachelor', 'Post-Graduate Diploma', 'Masters', 'PhD'
    ],
    termStructure: '3 Terms',
    gradingScale: 'A (70-100), B (60-69), C (50-59), D (45-49), E (40-44), F (<40)',
    nationalExams: ['BECE (JSS3)', 'WAEC SSCE', 'NECO SSCE', 'JAMB UTME', 'NABTEB'],
    payrollDeductions: [
      { name: 'PAYE', type: 'percentage', rate: 24, employeeShare: true, employerShare: false },
      { name: 'Pension (Employee)', type: 'percentage', rate: 8, employeeShare: true, employerShare: false },
      { name: 'Pension (Employer)', type: 'percentage', rate: 10, employeeShare: false, employerShare: true },
      { name: 'NHF', type: 'percentage', rate: 2.5, employeeShare: true, employerShare: false },
      { name: 'NSITF', type: 'percentage', rate: 1, employeeShare: false, employerShare: true },
    ],
    regulatoryAuthority: 'Federal Ministry of Education / WAEC / NECO / NUC / NBTE'
  },
  ZA: {
    code: 'ZA',
    name: 'South Africa',
    currency: 'ZAR',
    educationLevels: [
      'Grade R', 'Grade 1–7 (Primary)',
      'Grade 8–9 (Lower Secondary)',
      'Grade 10–12 (FET, NSC/Matric)',
      'NQF Level 5 (Higher Certificate)',
      'NQF Level 6 (Diploma / Advanced Certificate)',
      'NQF Level 7 (Bachelor)', 'NQF Level 8 (Honours/Postgrad Diploma)',
      'NQF Level 9 (Masters)', 'NQF Level 10 (PhD)'
    ],
    termStructure: '4 Terms',
    gradingScale: 'Level 7 (80-100), Level 6 (70-79), Level 5 (60-69), Level 4 (50-59), Level 3 (40-49), Level 2 (30-39), Level 1 (<30)',
    nationalExams: ['NSC Matric (Grade 12)', 'GETC (Adult Ed)', 'NC(V) TVET Exams'],
    payrollDeductions: [
      { name: 'PAYE', type: 'percentage', rate: 45, employeeShare: true, employerShare: false },
      { name: 'UIF (Employee)', type: 'percentage', rate: 1, cap: 1779, employeeShare: true, employerShare: false },
      { name: 'UIF (Employer)', type: 'percentage', rate: 1, cap: 1779, employeeShare: false, employerShare: true },
      { name: 'SDL', type: 'percentage', rate: 1, employeeShare: false, employerShare: true },
    ],
    regulatoryAuthority: 'Department of Basic Education (DBE) / DHET / Umalusi / SAQA'
  }
};

export function getFramework(code: string): CountryFramework | undefined {
  return COUNTRY_FRAMEWORKS[code.toUpperCase()];
}

export function getAllFrameworks(): CountryFramework[] {
  return Object.values(COUNTRY_FRAMEWORKS);
}

/**
 * Compute gross-to-net payroll for a given country and gross salary.
 * Returns itemised deductions and net pay.
 */
export function computePayroll(countryCode: string, grossSalary: number): {
  gross: number;
  deductions: { name: string; amount: number; party: 'employee' | 'employer' | 'both' }[];
  netPay: number;
  totalEmployeeDeductions: number;
  totalEmployerCost: number;
} {
  const framework = getFramework(countryCode);
  if (!framework) {
    return { gross: grossSalary, deductions: [], netPay: grossSalary, totalEmployeeDeductions: 0, totalEmployerCost: grossSalary };
  }

  const deductions: { name: string; amount: number; party: 'employee' | 'employer' | 'both' }[] = [];
  let totalEmployee = 0;
  let totalEmployer = 0;

  for (const rule of framework.payrollDeductions) {
    let amount = rule.type === 'percentage'
      ? (grossSalary * rule.rate) / 100
      : rule.rate;

    if (rule.cap !== undefined) {
      amount = Math.min(amount, rule.cap);
    }

    const party = rule.employeeShare && rule.employerShare ? 'both'
      : rule.employeeShare ? 'employee'
      : 'employer';

    deductions.push({ name: rule.name, amount: Math.round(amount), party });

    if (rule.employeeShare) totalEmployee += amount;
    if (rule.employerShare) totalEmployer += amount;
  }

  return {
    gross: grossSalary,
    deductions,
    netPay: Math.round(grossSalary - totalEmployee),
    totalEmployeeDeductions: Math.round(totalEmployee),
    totalEmployerCost: Math.round(grossSalary + totalEmployer)
  };
}
