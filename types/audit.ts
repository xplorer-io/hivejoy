// =============================================
// Audit Types
// =============================================

import type { UserRole } from './user';

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: UserRole;
  entityType: string;
  entityId: string;
  action: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  createdAt: string;
}
