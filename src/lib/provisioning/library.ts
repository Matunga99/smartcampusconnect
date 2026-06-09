export function provisionLibrary(db: any, school: any) {
  console.log(`Provisioning deep library structures for ${school.name}`);
  if (!db.library_categories) db.library_categories = [];
  ['Textbooks', 'Reference', 'Periodicals', 'Fiction', 'Art'].forEach(name => {
    db.library_categories.push({ schoolId: school.id, name });
  });
}
