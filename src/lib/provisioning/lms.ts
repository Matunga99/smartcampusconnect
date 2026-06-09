export function provisionLMS(db: any, school: any) {
  console.log(`Provisioning deep LMS structures for ${school.name}`);
  if (!db.lms_categories) db.lms_categories = [];
  ['General Courses', 'Assessments', 'Discussions', 'Workshops', 'Simulations'].forEach(name => {
    db.lms_categories.push({ schoolId: school.id, name });
  });
}
