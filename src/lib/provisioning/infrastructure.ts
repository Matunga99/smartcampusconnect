export function provisionInfrastructure(db: any, school: any) {
  console.log(`Provisioning infrastructure for ${school.name}`);
  if (!db.roles) db.roles = [];
  ['Administrator', 'Teacher', 'Student', 'Parent', 'Finance', 'Librarian'].forEach(name => {
    db.roles.push({ schoolId: school.id, name });
  });
  
  if (!db.communication_channels) db.communication_channels = [];
  ['General', 'Announcements', 'Emergency', 'Support'].forEach(name => {
    db.communication_channels.push({ schoolId: school.id, name });
  });
  
  if (!db.user_groups) db.user_groups = [];
  ['Students', 'Teachers', 'Parents', 'Finance', 'Registry', 'Library', 'Research', 'ICT Support'].forEach(name => {
    db.user_groups.push({ schoolId: school.id, name });
  });
}
