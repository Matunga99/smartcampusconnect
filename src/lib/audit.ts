export interface AuditLog {
  timestamp: string;
  action: string;
  tenantId: string;
  userId: string;
  details: any;
  status: 'success' | 'failure';
  reason?: string;
  metadata?: Record<string, any>;
}

export const logAudit = async (entry: AuditLog) => {
  // TODO: Persist to Firestore or a specialized Audit Ledger table
  console.log(`[AUDIT] ${entry.timestamp} | ${entry.tenantId} | ${entry.userId} | ${entry.action} | ${entry.status}`, entry);
};
