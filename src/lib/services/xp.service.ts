import { PrismaClient, Prisma } from '@prisma/client';
import { XP } from '@/lib/config/constants';
import db from '@/lib/db/client';

// ============================================================
// XP Engine Service
// ============================================================

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

interface AwardXpParams {
  userId: string;
  amount: number;
  sourceType: string;
  sourceId?: string;
  description?: string;
}

class XPService {
  /**
   * Award XP within a transaction. Handles:
   * 1. Creating XP transaction record
   * 2. Updating user total XP
   * 3. Recalculating level
   * 4. Creating activity log entry
   */
  async award(tx: TransactionClient, params: AwardXpParams): Promise<number> {
    // 1. Create XP transaction
    await tx.xpTransaction.create({
      data: {
        userId: params.userId,
        amount: params.amount,
        sourceType: params.sourceType,
        sourceId: params.sourceId,
        description: params.description,
      },
    });

    // 2. Update user total XP
    const user = await tx.user.update({
      where: { id: params.userId },
      data: { totalXp: { increment: params.amount } },
    });

    // 3. Recalculate level
    const newLevel = this.calculateLevel(user.totalXp);
    if (newLevel !== user.level) {
      await tx.user.update({
        where: { id: params.userId },
        data: { level: newLevel },
      });
    }

    // 4. Create activity log entry
    await tx.userActivity.create({
      data: {
        userId: params.userId,
        activityType: `xp_${params.sourceType}`,
        title: `+${params.amount} XP`,
        description: params.description,
        xpEarned: params.amount,
        sourceModule: params.sourceType.split('_')[0],
        sourceId: params.sourceId,
      },
    });

    return user.totalXp;
  }

  /**
   * Award XP outside a transaction (creates its own).
   */
  async awardStandalone(params: AwardXpParams): Promise<number> {
    return db.$transaction(async (tx) => {
      return this.award(tx, params);
    });
  }

  /**
   * Calculate level from total XP using the level curve.
   */
  calculateLevel(totalXp: number): number {
    const curve = XP.LEVEL_CURVE;
    let level = 1;

    for (let i = 0; i < curve.length; i++) {
      if (totalXp >= curve[i]) {
        level = i + 1;
      } else {
        break;
      }
    }

    // Beyond defined curve: +INCREMENT per level
    if (totalXp >= curve[curve.length - 1]) {
      level = curve.length + Math.floor(
        (totalXp - curve[curve.length - 1]) / XP.BEYOND_CURVE_INCREMENT
      );
    }

    return level;
  }

  /**
   * Get XP needed for next level.
   */
  getXpForNextLevel(currentXp: number): { current: number; needed: number; progress: number } {
    const curve = XP.LEVEL_CURVE;
    const level = this.calculateLevel(currentXp);

    let currentThreshold: number;
    let nextThreshold: number;

    if (level <= curve.length) {
      currentThreshold = curve[level - 1] || 0;
      nextThreshold = curve[level] || currentThreshold + XP.BEYOND_CURVE_INCREMENT;
    } else {
      const beyondBase = curve[curve.length - 1];
      const beyondLevels = level - curve.length;
      currentThreshold = beyondBase + (beyondLevels * XP.BEYOND_CURVE_INCREMENT);
      nextThreshold = currentThreshold + XP.BEYOND_CURVE_INCREMENT;
    }

    const needed = nextThreshold - currentXp;
    const levelRange = nextThreshold - currentThreshold;
    const progress = levelRange > 0 ? ((currentXp - currentThreshold) / levelRange) * 100 : 100;

    return { current: currentXp, needed: Math.max(0, needed), progress: Math.min(100, progress) };
  }

  /**
   * Get XP history for a user.
   */
  async getHistory(userId: string, page: number = 1, limit: number = 20) {
    const [transactions, total] = await Promise.all([
      db.xpTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.xpTransaction.count({ where: { userId } }),
    ]);

    return { transactions, total };
  }
}

export const xpService = new XPService();
