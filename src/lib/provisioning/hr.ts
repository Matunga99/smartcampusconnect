export function provisionHR(db: any, school: any) {
  console.log(`Provisioning deep HR structures for ${school.name}`);
  if (!db.hr_departments) db.hr_departments = [];
  ['Academic', 'Administration', 'ICT', 'Finance', 'Support'].forEach(name => {
    db.hr_departments.push({ schoolId: school.id, name });
  });
  
  if (!db.leave_types) db.leave_types = [];
  ['Sick', 'Annual', 'Maternity', 'Study', 'Unauthorized'].forEach(name => {
    db.leave_types.push({ schoolId: school.id, name });
  });

  if (!db.payroll_structures) db.payroll_structures = [];
  db.payroll_structures.push({ schoolId: school.id, name: 'Standard Academic' });
}
