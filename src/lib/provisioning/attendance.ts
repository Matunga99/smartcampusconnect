export function provisionAttendance(db: any, school: any) {
  console.log(`Provisioning deep attendance structures for ${school.name}`);
  if (!db.attendance_policies) db.attendance_policies = [];
  ['Daily Attendance', 'Lesson Attendance', 'Meeting Attendance'].forEach(name => {
    db.attendance_policies.push({ schoolId: school.id, name });
  });
}
