export function provisionERP(db: any, school: any) {
  console.log(`Provisioning deep ERP structures for ${school.name}`);
  if (!db.inventory_stores) db.inventory_stores = [];
  ['Main Store', 'Departmental Store', 'Academic Store'].forEach(name => {
    db.inventory_stores.push({ schoolId: school.id, name });
  });
}
