import { queueEvent, processQueue } from './eventQueue';
import { runSaga, SagaStep } from './saga';

export async function triggerWorkflow(type: string, data: any, db: any) {
  console.log(`Workflow triggered: ${type}`, data);

  // Queue the event for reliable processing
  // Generate a correlationId for the workflow chain
  const correlationId = data.correlationId || `chain-${Date.now()}`;
  
  // Use a unique idempotency key based on type + data if not provided
  const idempotencyKey = typeof data === 'object' ? `${type}-${JSON.stringify(data)}` : `${type}-${data}`;

  queueEvent(type, data, db, { correlationId, idempotencyKey });

  // Define the actual processing logic
  const processor = async (t: string, d: any, database: any) => {
    switch (t) {
      case 'STUDENT_ADMITTED':
        const steps: SagaStep[] = [
            {
                id: 'create_user',
                action: async () => {
                    if (!database.users) database.users = [];
                    database.users.push({ id: `u-${Date.now()}`, ...d, role: 'student', passwordHash: 'default123' });
                },
                compensate: async () => { /* Logic to remove user */ }
            },
            {
                id: 'init_finance_profile',
                action: async () => { /* Logic to init balance */ },
                compensate: async () => { /* Logic to delete balance */ }
            }
        ];
        await runSaga(steps);
        break;
      case 'STUDENT_ENROLLED':
        if (!database.course_registrations) database.course_registrations = [];
        database.course_registrations.push({
          id: `cr-${Date.now()}`,
          studentId: d.studentId,
          unitId: d.unitId,
          registrationDate: new Date().toISOString()
        });
        break;
      case 'FEE_PAID':
        if (!database.payment_transactions) database.payment_transactions = [];
        database.payment_transactions.push({
          id: `pay-${Date.now()}`,
          studentId: d.studentId,
          amount: d.amount,
          status: 'completed',
          date: new Date().toISOString()
        });
        break;
      case 'ATTENDANCE_LOW':
        if (!database.notifications) database.notifications = [];
        database.notifications.push({
          id: `notif-${Date.now()}`,
          recipientId: d.parentId,
          message: `Attendance alert for student ${d.studentName}: Below threshold.`,
          read: false
        });
        break;
      case 'EXAM_PUBLISHED':
        if (!database.notifications) database.notifications = [];
        database.notifications.push({
          id: `notif-${Date.now()}`,
          recipientId: d.studentId,
          message: `Exam published: ${d.examName}`,
          read: false
        });
        break;
      case 'EMPLOYEE_HIRED':
        if (!database.employees) database.employees = [];
        database.employees.push({
          id: `emp-${Date.now()}`,
          name: d.name,
          email: d.email,
          employmentStatus: 'Active'
        });
        break;
      default:
        throw new Error(`Unknown workflow type: ${t}`);
    }
  };

  // Process the queue
  await processQueue(db, processor);
}
