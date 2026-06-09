export interface GlobalFaculty {
  id: string;
  name: string;
  code: string;
  disabled: boolean;
}

export interface GlobalDepartment {
  id: string;
  facultyId: string;
  name: string;
  disabled: boolean;
}

export interface GlobalProgram {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  capacity?: number;
  disabled: boolean;
}

export interface GlobalUnit {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  disabled: boolean;
}

export interface GlobalProgramUnit {
  id: string;
  programId: string;
  unitId: string;
}

export const DEFAULT_FACULTIES: Omit<GlobalFaculty, 'disabled'>[] = [
  { id: "gf-1", name: "School of Computing & Information Technology", code: "SCIT" },
  { id: "gf-2", name: "School of Engineering & Technology", code: "SET" },
  { id: "gf-3", name: "School of Business & Economics", code: "SBE" },
  { id: "gf-4", name: "School of Education", code: "SE" },
  { id: "gf-5", name: "School of Health Sciences", code: "SHS" },
  { id: "gf-6", name: "School of Nursing", code: "SN" },
  { id: "gf-7", name: "School of Agriculture & Environmental Sciences", code: "SAES" },
  { id: "gf-8", name: "School of Hospitality & Tourism Management", code: "SHTM" },
  { id: "gf-9", name: "School of Media, Communication & Journalism", code: "SMCJ" },
  { id: "gf-10", name: "School of Law", code: "SL" },
  { id: "gf-11", name: "School of Applied Sciences", code: "SAS" },
  { id: "gf-12", name: "School of Architecture & Built Environment", code: "SABE" },
  { id: "gf-13", name: "School of Social Sciences", code: "SSS" },
  { id: "gf-14", name: "School of Arts & Humanities", code: "SAH" },
  { id: "gf-15", name: "School of Mathematics & Statistics", code: "SMS" },
  { id: "gf-16", name: "School of Physical Sciences", code: "SPS" },
  { id: "gf-17", name: "School of Biological Sciences", code: "SBS" },
  { id: "gf-18", name: "School of Public Health", code: "SPH" },
  { id: "gf-19", name: "School of Pharmacy", code: "SP" },
  { id: "gf-20", name: "School of Veterinary Sciences", code: "SVS" },
  { id: "gf-21", name: "School of Creative Arts & Design", code: "SCAD" },
  { id: "gf-22", name: "School of Aviation & Aerospace Studies", code: "SAAS" },
  { id: "gf-23", name: "School of Maritime Studies", code: "SMS2" },
  { id: "gf-24", name: "School of Theology & Religious Studies", code: "STRS" },
  { id: "gf-25", name: "School of Security, Intelligence & Criminology", code: "SSIC" }
];

export const DEFAULT_DEPARTMENTS: Omit<GlobalDepartment, 'disabled'>[] = [
  // SCIT (gf-1)
  { id: "gd-1", facultyId: "gf-1", name: "Computer Science" },
  { id: "gd-2", facultyId: "gf-1", name: "Information Technology" },
  { id: "gd-3", facultyId: "gf-1", name: "Software Engineering" },
  { id: "gd-4", facultyId: "gf-1", name: "Data Science" },
  { id: "gd-5", facultyId: "gf-1", name: "Cyber Security" },
  { id: "gd-6", facultyId: "gf-1", name: "Artificial Intelligence" },
  { id: "gd-7", facultyId: "gf-1", name: "Information Systems" },

  // SET (gf-2)
  { id: "gd-8", facultyId: "gf-2", name: "Civil Engineering" },
  { id: "gd-9", facultyId: "gf-2", name: "Mechanical Engineering" },
  { id: "gd-10", facultyId: "gf-2", name: "Electrical Engineering" },
  { id: "gd-11", facultyId: "gf-2", name: "Electronics Engineering" },
  { id: "gd-12", facultyId: "gf-2", name: "Mechatronics Engineering" },
  { id: "gd-13", facultyId: "gf-2", name: "Chemical Engineering" },

  // SBE (gf-3)
  { id: "gd-14", facultyId: "gf-3", name: "Accounting" },
  { id: "gd-15", facultyId: "gf-3", name: "Finance" },
  { id: "gd-16", facultyId: "gf-3", name: "Marketing" },
  { id: "gd-17", facultyId: "gf-3", name: "Human Resource Management" },
  { id: "gd-18", facultyId: "gf-3", name: "Procurement & Supply Chain" },
  { id: "gd-19", facultyId: "gf-3", name: "Economics" },
  { id: "gd-20", facultyId: "gf-3", name: "Entrepreneurship" },

  // SE (gf-4)
  { id: "gd-21", facultyId: "gf-4", name: "Educational Foundations" },
  { id: "gd-22", facultyId: "gf-4", name: "Curriculum Studies" },

  // SHS (gf-5)
  { id: "gd-23", facultyId: "gf-5", name: "Clinical Medicine" },
  { id: "gd-24", facultyId: "gf-5", name: "Medical Laboratory Sciences" },
  { id: "gd-25", facultyId: "gf-5", name: "Human Nutrition & Dietetics" },

  // SN (gf-6)
  { id: "gd-26", facultyId: "gf-6", name: "General Nursing" },
  { id: "gd-27", facultyId: "gf-6", name: "Community Health Nursing" },

  // SAES (gf-7)
  { id: "gd-28", facultyId: "gf-7", name: "Crop Science" },
  { id: "gd-29", facultyId: "gf-7", name: "Environmental Conservation" },

  // SHTM (gf-8)
  { id: "gd-30", facultyId: "gf-8", name: "Hospitality Management" },
  { id: "gd-31", facultyId: "gf-8", name: "Tourism & Travel" },

  // SMCJ (gf-9)
  { id: "gd-32", facultyId: "gf-9", name: "Digital Journalism" },
  { id: "gd-33", facultyId: "gf-9", name: "Public Relations & Media" },

  // SL (gf-10)
  { id: "gd-34", facultyId: "gf-10", name: "Public Law" },
  { id: "gd-35", facultyId: "gf-10", name: "Private Law" },

  // SAS (gf-11)
  { id: "gd-36", facultyId: "gf-11", name: "Industrial Chemistry" },
  { id: "gd-37", facultyId: "gf-11", name: "Biotechnology" },

  // SABE (gf-12)
  { id: "gd-38", facultyId: "gf-12", name: "Architecture" },
  { id: "gd-39", facultyId: "gf-12", name: "Construction Management" },

  // SSS (gf-13)
  { id: "gd-40", facultyId: "gf-13", name: "Sociology" },
  { id: "gd-41", facultyId: "gf-13", name: "Political Studies" },

  // SAH (gf-14)
  { id: "gd-42", facultyId: "gf-14", name: "Literature & Linguistics" },
  { id: "gd-43", facultyId: "gf-14", name: "History" },

  // SMS (gf-15)
  { id: "gd-44", facultyId: "gf-15", name: "Pure Mathematics" },
  { id: "gd-45", facultyId: "gf-15", name: "Actuarial Science" },

  // SPS (gf-16)
  { id: "gd-46", facultyId: "gf-16", name: "Physics" },
  { id: "gd-47", facultyId: "gf-16", name: "Electronics" },

  // SBS (gf-17)
  { id: "gd-48", facultyId: "gf-17", name: "Biology" },
  { id: "gd-49", facultyId: "gf-17", name: "Microbiology" },

  // SPH (gf-18)
  { id: "gd-50", facultyId: "gf-18", name: "Epidemiology" },
  { id: "gd-51", facultyId: "gf-18", name: "Environmental Health" },

  // SP (gf-19)
  { id: "gd-52", facultyId: "gf-19", name: "Pharmacology" },
  { id: "gd-53", facultyId: "gf-19", name: "Pharmaceutics" },

  // SVS (gf-20)
  { id: "gd-54", facultyId: "gf-20", name: "Veterinary Medicine" },
  { id: "gd-55", facultyId: "gf-20", name: "Animal Physiology" },

  // SCAD (gf-21)
  { id: "gd-56", facultyId: "gf-21", name: "Visual Arts" },
  { id: "gd-57", facultyId: "gf-21", name: "Interior Design" },

  // SAAS (gf-22)
  { id: "gd-58", facultyId: "gf-22", name: "Aviation Systems" },
  { id: "gd-59", facultyId: "gf-22", name: "Aerospace Maintenance" },

  // SMS2 (gf-23)
  { id: "gd-60", facultyId: "gf-23", name: "Marine Engineering" },
  { id: "gd-61", facultyId: "gf-23", name: "Nautical Studies" },

  // STRS (gf-24)
  { id: "gd-62", facultyId: "gf-24", name: "Theology" },
  { id: "gd-63", facultyId: "gf-24", name: "Comparative Religions" },

  // SSIC (gf-25)
  { id: "gd-64", facultyId: "gf-25", name: "Criminology & Criminal Justice" },
  { id: "gd-65", facultyId: "gf-25", name: "Intelligence & Cybercrime" }
];

export const DEFAULT_PROGRAMS: Omit<GlobalProgram, 'disabled'>[] = [
  // Computing Certificates (gd-1, gd-2)
  { id: "gp-1", departmentId: "gd-2", name: "Certificate in ICT", code: "CICT", capacity: 50 },
  
  // Computing Diplomas
  { id: "gp-2", departmentId: "gd-1", name: "Diploma in Computer Science", code: "DCS", capacity: 100 },
  { id: "gp-3", departmentId: "gd-2", name: "Diploma in Information Technology", code: "DIT", capacity: 120 },
  { id: "gp-4", departmentId: "gd-3", name: "Diploma in Software Engineering", code: "DSE", capacity: 80 },

  // Computing Bachelors
  { id: "gp-5", departmentId: "gd-1", name: "Bachelor of Science in Computer Science", code: "BCS", capacity: 200 },
  { id: "gp-6", departmentId: "gd-2", name: "Bachelor of Science in Information Technology", code: "BIT", capacity: 250 },
  { id: "gp-7", departmentId: "gd-3", name: "Bachelor of Science in Software Engineering", code: "BSE", capacity: 150 },
  { id: "gp-8", departmentId: "gd-4", name: "Bachelor of Data Science", code: "BDS", capacity: 100 },
  { id: "gp-9", departmentId: "gd-5", name: "Bachelor of Cyber Security", code: "BYBER", capacity: 120 },

  // Computing Masters / PhDs
  { id: "gp-10", departmentId: "gd-1", name: "Master of Computer Science", code: "MCS", capacity: 40 },
  { id: "gp-11", departmentId: "gd-2", name: "Master of Information Technology", code: "MIT", capacity: 50 },
  { id: "gp-12", departmentId: "gd-1", name: "PhD in Computer Science", code: "PHDCS", capacity: 15 },
  { id: "gp-13", departmentId: "gd-7", name: "PhD in Information Systems", code: "PHDIS", capacity: 15 },

  // Business Certificates
  { id: "gp-14", departmentId: "gd-14", name: "Certificate in Accounting", code: "CACC", capacity: 50 },
  { id: "gp-15", departmentId: "gd-17", name: "Certificate in Business Management", code: "CBM", capacity: 60 },

  // Business Diplomas
  { id: "gp-16", departmentId: "gd-17", name: "Diploma in Business Management", code: "DBM", capacity: 150 },
  { id: "gp-17", departmentId: "gd-14", name: "Diploma in Accounting", code: "DIA", capacity: 100 },
  { id: "gp-18", departmentId: "gd-16", name: "Diploma in Marketing", code: "DIM", capacity: 80 },

  // Business Bachelors
  { id: "gp-19", departmentId: "gd-15", name: "Bachelor of Commerce", code: "BCOM", capacity: 300 },
  { id: "gp-20", departmentId: "gd-14", name: "Bachelor of Accounting", code: "BACC", capacity: 180 },
  { id: "gp-19e", departmentId: "gd-19", name: "Bachelor of Economics", code: "BECO", capacity: 150 },

  // Business Masters / PhDs
  { id: "gp-21", departmentId: "gd-17", name: "Master of Business Administration", code: "MBA", capacity: 120 },
  { id: "gp-22", departmentId: "gd-17", name: "PhD in Business Administration", code: "PHDBA", capacity: 20 },

  // Engineering Diplomas (gd-8, gd-10)
  { id: "gp-23", departmentId: "gd-8", name: "Diploma in Civil Engineering", code: "DCE", capacity: 80 },
  { id: "gp-24", departmentId: "gd-10", name: "Diploma in Electrical Engineering", code: "DEE", capacity: 100 },

  // Engineering Bachelors
  { id: "gp-25", departmentId: "gd-8", name: "Bachelor of Science in Civil Engineering", code: "BSCE", capacity: 120 },
  { id: "gp-26", departmentId: "gd-9", name: "Bachelor of Science in Mechanical Engineering", code: "BSME", capacity: 100 },
  { id: "gp-27", departmentId: "gd-10", name: "Bachelor of Science in Electrical Engineering", code: "BSEE", capacity: 120 },

  // Education Bachelors (gd-22)
  { id: "gp-28", departmentId: "gd-22", name: "Bachelor of Education Arts", code: "BEDALT", capacity: 400 },
  { id: "gp-29", departmentId: "gd-22", name: "Bachelor of Education Science", code: "BEDSCI", capacity: 300 },
  { id: "gp-30", departmentId: "gd-22", name: "Master of Education", code: "MED", capacity: 50 },
  { id: "gp-31", departmentId: "gd-21", name: "PhD in Education", code: "PHDED", capacity: 25 },

  // Health / Nursing Programs
  { id: "gp-32", departmentId: "gd-25", name: "Certificate in Community Health", code: "CCH", capacity: 80 },
  { id: "gp-33", departmentId: "gd-26", name: "Diploma in Nursing", code: "DNUR", capacity: 120 },
  { id: "gp-34", departmentId: "gd-26", name: "Bachelor of Science in Nursing", code: "BSN", capacity: 150 },
  { id: "gp-35", departmentId: "gd-23", name: "Bachelor of Public Health", code: "BPH", capacity: 180 },
  { id: "gp-36", departmentId: "gd-23", name: "Master of Public Health", code: "MPH", capacity: 80 },

  // Hospitality
  { id: "gp-37", departmentId: "gd-30", name: "Certificate in Hospitality Operations", code: "CHO", capacity: 60 },

  // Media & Journalism
  { id: "gp-38", departmentId: "gd-32", name: "Diploma in Journalism", code: "DJOUR", capacity: 70 },
  { id: "gp-39", departmentId: "gd-32", name: "Bachelor of Journalism", code: "BJOUR", capacity: 120 },

  // Law (gd-34)
  { id: "gp-40", departmentId: "gd-34", name: "Bachelor of Laws", code: "LLB", capacity: 200 }
];

export const DEFAULT_UNITS: Omit<GlobalUnit, 'disabled'>[] = [
  // Computer Science / IT (gd-1, gd-2)
  { id: "gu-1", departmentId: "gd-1", name: "Programming Fundamentals", code: "CSC101" },
  { id: "gu-2", departmentId: "gd-1", name: "Database Systems", code: "CSC102" },
  { id: "gu-3", departmentId: "gd-1", name: "Data Structures", code: "CSC103" },
  { id: "gu-4", departmentId: "gd-1", name: "Computer Architecture", code: "CSC104" },
  { id: "gu-5", departmentId: "gd-1", name: "Operating Systems", code: "CSC201" },
  { id: "gu-6", departmentId: "gd-1", name: "Software Engineering", code: "CSC202" },
  { id: "gu-7", departmentId: "gd-1", name: "Artificial Intelligence", code: "CSC203" },
  { id: "gu-8", departmentId: "gd-1", name: "Computer Networks", code: "CSC204" },
  { id: "gu-9", departmentId: "gd-1", name: "Machine Learning", code: "CSC301" },
  { id: "gu-10", departmentId: "gd-1", name: "Distributed Systems", code: "CSC302" },

  // IT Specific
  { id: "gu-11", departmentId: "gd-2", name: "Computer Applications", code: "ICT101" },
  { id: "gu-12", departmentId: "gd-2", name: "Networking Fundamentals", code: "ICT102" },
  { id: "gu-13", departmentId: "gd-2", name: "Web Development", code: "ICT103" },
  { id: "gu-14", departmentId: "gd-2", name: "Systems Analysis", code: "ICT201" },
  { id: "gu-15", departmentId: "gd-2", name: "Cloud Computing", code: "ICT202" },

  // Business ACC, FIN
  { id: "gu-16", departmentId: "gd-14", name: "Principles of Accounting", code: "ACC101" },
  { id: "gu-17", departmentId: "gd-14", name: "Financial Accounting", code: "ACC102" },
  { id: "gu-18", departmentId: "gd-15", name: "Introduction to Finance", code: "FIN101" },
  { id: "gu-19", departmentId: "gd-16", name: "Marketing Principles", code: "MKT101" },
  { id: "gu-20", departmentId: "gd-17", name: "Human Resource Management", code: "HRM101" },

  // Engineering
  { id: "gu-21", departmentId: "gd-8", name: "Engineering Mathematics", code: "ENG101" },
  { id: "gu-22", departmentId: "gd-8", name: "Engineering Physics", code: "ENG102" },
  { id: "gu-23", departmentId: "gd-8", name: "Engineering Drawing", code: "CIV101" },
  { id: "gu-24", departmentId: "gd-8", name: "Surveying", code: "CIV102" },

  // Nursing & Public Health
  { id: "gu-25", departmentId: "gd-26", name: "Fundamentals of Nursing", code: "NUR101" },
  { id: "gu-26", departmentId: "gd-26", name: "Human Anatomy", code: "NUR102" },
  { id: "gu-27", departmentId: "gd-23", name: "Public Health Principles", code: "PH101" }
];

// Many to many mappings
export const DEFAULT_PROGRAM_UNITS: Omit<GlobalProgramUnit, 'id'>[] = [
  // CSC101 is linked to BCS, BIT, DCS, DIT
  { programId: "gp-5", unitId: "gu-1" }, // BCS
  { programId: "gp-6", unitId: "gu-1" }, // BIT
  { programId: "gp-2", unitId: "gu-1" }, // DCS
  { programId: "gp-3", unitId: "gu-1" }, // DIT

  // CSC102 is linked to BCS, BIT, DCS, DIT
  { programId: "gp-5", unitId: "gu-2" },
  { programId: "gp-6", unitId: "gu-2" },
  { programId: "gp-2", unitId: "gu-2" },
  { programId: "gp-3", unitId: "gu-2" },

  // CSC103 to BCS, DCS
  { programId: "gp-5", unitId: "gu-3" },
  { programId: "gp-2", unitId: "gu-3" },

  // CSC104 to BCS, DCS, BSEE
  { programId: "gp-5", unitId: "gu-4" },
  { programId: "gp-2", unitId: "gu-4" },
  { programId: "gp-27", unitId: "gu-4" }, // BSEE

  // Operating systems
  { programId: "gp-5", unitId: "gu-5" },
  { programId: "gp-6", unitId: "gu-5" },

  // Business Units mappings
  { programId: "gp-19", unitId: "gu-16" }, // BCOM -> Principles of Accounting
  { programId: "gp-20", unitId: "gu-16" }, // BACC
  { programId: "gp-19", unitId: "gu-18" }, // BCOM -> Finance
  { programId: "gp-21", unitId: "gu-20" }, // MBA -> Human Resource
];
