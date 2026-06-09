
export type Role = 'superadmin' | 'schooladmin' | 'lecturer' | 'student' | 'parent';

export interface Permission {
  action: string; // e.g., 'read:finance', 'write:student_record'
  resource: string;
}

export const RBAC_POLICY: Record<Role, Permission[]> = {
  superadmin: [{ action: '*', resource: '*' }],
  schooladmin: [{ action: 'manage', resource: 'school' }, { action: 'read', resource: 'finance' }],
  lecturer: [{ action: 'read', resource: 'student_record' }, { action: 'write', resource: 'attendance' }],
  student: [{ action: 'read', resource: 'self' }, { action: 'read', resource: 'results' }],
  parent: [
    { action: 'read', resource: 'student_record' },
    { action: 'read', resource: 'attendance' },
    { action: 'read', resource: 'finance' },
    { action: 'read', resource: 'disciplinary_record' }
  ]
};

export const canAccess = (role: Role, action: string, resource: string): boolean => {
  const permissions = RBAC_POLICY[role];
  if (!permissions) return false;
  
  return permissions.some(p => 
    (p.action === '*' || p.action === action) && 
    (p.resource === '*' || p.resource === resource)
  );
};
