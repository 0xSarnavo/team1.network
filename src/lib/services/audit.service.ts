import db from '@/lib/db/client';
import type { AuditSeverity } from '@prisma/client';

// ============================================================
// Audit Logger Service
// ============================================================

interface AuditLogParams {
  userId?: string;
  module: string;
  action: string;
  severity?: AuditSeverity;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

class AuditService {
  /**
   * Write an audit log entry.
   * Resolves user email/name from DB for denormalized storage.
   */
  async log(params: AuditLogParams): Promise<void> {
    let userEmail: string | undefined;
    let userName: string | undefined;

    if (params.userId) {
      const user = await db.user.findUnique({
        where: { id: params.userId },
        select: { email: true, displayName: true },
      });
      userEmail = user?.email;
      userName = user?.displayName;
    }

    await db.auditLog.create({
      data: {
        userId: params.userId,
        userEmail,
        userName,
        module: params.module,
        action: params.action,
        severity: params.severity || 'normal',
        entityType: params.entityType,
        entityId: params.entityId,
        entityName: params.entityName,
        details: (params.details as Record<string, string | number | boolean | null>) || undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  }

  /**
   * Query audit logs with filters and pagination.
   */
  async query(filters: {
    module?: string;
    userId?: string;
    severity?: AuditSeverity;
    action?: string;
    entityType?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 50;

    const where: Record<string, unknown> = {};
    if (filters.module) where.module = filters.module;
    if (filters.userId) where.userId = filters.userId;
    if (filters.severity) where.severity = filters.severity;
    if (filters.action) where.action = { contains: filters.action };
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {
        ...(filters.startDate && { gte: filters.startDate }),
        ...(filters.endDate && { lte: filters.endDate }),
      };
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.auditLog.count({ where }),
    ]);

    return { logs, total };
  }
}

export const auditService = new AuditService();
