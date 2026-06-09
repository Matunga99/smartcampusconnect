export function provisionFinance(db: any, school: any) {
  console.log(`Provisioning deep finance structures for ${school.name}`);
  if (!db.chart_of_accounts) db.chart_of_accounts = [];
  ['Cash', 'Bank', 'Assets', 'Liabilities', 'Equity', 'Revenue', 'Expenses'].forEach(acc => {
    db.chart_of_accounts.push({ schoolId: school.id, account: acc, type: 'General' });
  });
  
  if (!db.fee_categories) db.fee_categories = [];
  ['Tuition', 'Library', 'Exam', 'Development', 'Transport'].forEach(name => {
    db.fee_categories.push({ schoolId: school.id, name });
  });
}
