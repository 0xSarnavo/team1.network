import db from '@/lib/db/client';
import { cache } from '@/lib/helpers/cache';

// ============================================================
// Notification Service
// ============================================================

interface SendNotificationParams {
  userId: string;
  module: string;
  type: string;
  title: string;
  body: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
}

class NotificationService {
  /**
   * Send a notification. Checks user preferences, creates in-app,
   * and queues email if enabled.
   */
  async send(params: SendNotificationParams): Promise<void> {
    // 1. Check user preferences
    const prefs = await this.getPreferences(params.userId, params.type);

    // 2. Create in-app notification (unless user disabled)
    if (prefs.channelInapp) {
      await db.notification.create({
        data: {
          userId: params.userId,
          module: params.module,
          type: params.type,
          title: params.title,
          body: params.body,
          actionUrl: params.actionUrl,
          actionLabel: params.actionLabel,
          metadata: (params.metadata as Record<string, string | number | boolean | null>) || undefined,
        },
      });
    }

    // 3. Queue email if enabled
    if (prefs.channelEmail) {
      await this.queueEmail(params);
    }

    // 4. Invalidate unread count cache
    await cache.del(`notifications:count:${params.userId}`);
  }

  /**
   * Send notification to multiple users.
   */
  async sendBulk(userIds: string[], params: Omit<SendNotificationParams, 'userId'>): Promise<void> {
    await Promise.allSettled(
      userIds.map((userId) => this.send({ ...params, userId }))
    );
  }

  /**
   * Get user notification preferences for a specific type.
   */
  async getPreferences(userId: string, notificationType: string) {
    const pref = await db.notificationPreference.findUnique({
      where: {
        userId_notificationType: {
          userId,
          notificationType,
        },
      },
    });

    // Default: all channels enabled
    return {
      channelEmail: pref?.channelEmail ?? true,
      channelInapp: pref?.channelInapp ?? true,
      channelPush: pref?.channelPush ?? true,
    };
  }

  /**
   * Get unread notification count (cached).
   */
  async getUnreadCount(userId: string): Promise<number> {
    const cached = await cache.get<number>(`notifications:count:${userId}`);
    if (cached !== null) return cached;

    const count = await db.notification.count({
      where: { userId, isRead: false },
    });

    await cache.set(`notifications:count:${userId}`, count, 300); // 5 min cache
    return count;
  }

  /**
   * Mark notifications as read.
   */
  async markAsRead(userId: string, notificationIds: string[]): Promise<void> {
    await db.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    await cache.del(`notifications:count:${userId}`);
  }

  /**
   * Mark all notifications as read.
   */
  async markAllAsRead(userId: string): Promise<void> {
    await db.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    await cache.del(`notifications:count:${userId}`);
  }

  /**
   * Get user notifications (paginated).
   */
  async getNotifications(userId: string, page: number = 1, limit: number = 20, unreadOnly: boolean = false) {
    const where: Record<string, unknown> = { userId };
    if (unreadOnly) where.isRead = false;

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.notification.count({ where }),
    ]);

    return { notifications, total };
  }

  /**
   * Queue an email notification (placeholder — integrate with SendGrid/Resend).
   */
  private async queueEmail(params: SendNotificationParams): Promise<void> {
    // Get email template
    const template = await db.emailTemplate.findUnique({
      where: { notificationType: params.type },
    });

    if (!template || !template.isActive) return;

    // TODO: Integrate with email provider (SendGrid/Resend)
    // For now, log the intent
    console.log(`[EMAIL QUEUE] To: ${params.userId}, Subject: ${template.subjectTemplate}, Type: ${params.type}`);
  }
}

export const notificationService = new NotificationService();
