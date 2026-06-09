export function provisionAcademic(db: any, school: any) {
  console.log(`Provisioning deep academic structures for ${school.type}`);
  
  if (!db.academic_years) db.academic_years = [];
  const ayId = `ay_${Date.now()}`;
  db.academic_years.push({ id: ayId, schoolId: school.id, name: '2026/2027' });

  if (!db.terms) db.terms = [];
  if (!db.departments) db.departments = [];
  if (!db.grades) db.grades = [];
  if (!db.subjects) db.subjects = [];

  switch (school.type) {
    case 'University':
      ['Semester 1', 'Semester 2'].forEach(t => db.terms.push({ schoolId: school.id, name: t, yearId: ayId }));
      ['Science', 'Business', 'Education', 'Engineering', 'Health Sciences'].forEach(f => {
        const deptId = `d_${Date.now()}_${f}`;
        db.departments.push({ id: deptId, schoolId: school.id, faculty: f, name: `${f} Department` });
      });
      break;

    case 'Primary School':
    case 'Lower Primary School':
      ['Term 1', 'Term 2', 'Term 3'].forEach(t => db.terms.push({ schoolId: school.id, name: t, yearId: ayId }));
      for (let i = 1; i <= 8; i++) {
        db.grades.push({ schoolId: school.id, name: `Grade ${i}` });
        db.subjects.push({ schoolId: school.id, name: `Subject ${i}`, grade: `Grade ${i}` });
      }
      break;

    case 'Secondary School':
      ['Term 1', 'Term 2', 'Term 3'].forEach(t => db.terms.push({ schoolId: school.id, name: t, yearId: ayId }));
      ['Form 1', 'Form 2', 'Form 3', 'Form 4'].forEach(f => db.grades.push({ schoolId: school.id, name: f }));
      break;

    case 'TVET Institution':
      ['Semester 1', 'Semester 2'].forEach(t => db.terms.push({ schoolId: school.id, name: t, yearId: ayId }));
      ['ICT', 'Hospitality', 'Engineering'].forEach(d => db.departments.push({ schoolId: school.id, name: d }));
      break;

    case 'Corporate Academy':
      ['Learning Path Alpha', 'Learning Path Beta'].forEach(p => db.departments.push({ schoolId: school.id, name: p }));
      break;
  }
}
