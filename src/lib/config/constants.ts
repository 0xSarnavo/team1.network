// ============================================================
// Platform-Wide Constants
// ============================================================

export const AUTH = {
  BCRYPT_ROUNDS: 12,
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY_DAYS: 30,
  EMAIL_VERIFICATION_EXPIRY_HOURS: 24,
  PASSWORD_RESET_EXPIRY_HOURS: 1,
  MAX_SESSIONS_PER_USER: 10,
  RATE_LIMIT: {
    LOGIN: { max: 5, windowMinutes: 15 },
    SIGNUP: { max: 3, windowHours: 1 },
    FORGOT_PASSWORD: { max: 3, windowHours: 1 },
  },
  PASSWORD_RULES: {
    minLength: 8,
    requireUppercase: true,
    requireNumber: true,
  },
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const XP = {
  LEVEL_CURVE: [0, 100, 250, 500, 1000, 1500, 2000, 2500, 3000, 4000,
    5500, 6000, 6500, 7000, 7500, 8000, 8500, 9000, 9500, 10000],
  BEYOND_CURVE_INCREMENT: 1000,
  SOURCES: {
    BOUNTY_BASE: 'bounty_base',
    BOUNTY_WINNER: 'bounty_winner',
    QUEST_COMPLETE: 'quest_complete',
    EVENT_ATTEND: 'event_attend',
    EVENT_HOST: 'event_host',
    GRANT_MILESTONE: 'grant_milestone',
    PROFILE_COMPLETE: 'profile_complete',
    BADGE_BONUS: 'badge_bonus',
    COMMUNITY: 'community',
    MANUAL: 'manual',
  },
} as const;

export const MODULES = {
  PORTAL: 'portal',
  GRANTS: 'grants',
  BOUNTY: 'bounty',
  ECOSYSTEM: 'ecosystem',
  HOME: 'home',
  ADMIN: 'admin',
} as const;

export const UPLOAD = {
  RULES: {
    profile_avatar: { maxSize: 2_000_000, types: ['image/jpeg', 'image/png', 'image/webp'] },
    profile_cover: { maxSize: 5_000_000, types: ['image/jpeg', 'image/png', 'image/webp'] },
    bounty_submission: { maxSize: 25_000_000, types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'application/zip'] },
    grant_application: { maxSize: 10_000_000, types: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] },
    ecosystem_logo: { maxSize: 2_000_000, types: ['image/jpeg', 'image/png', 'image/svg+xml'] },
    badge_icon: { maxSize: 1_000_000, types: ['image/jpeg', 'image/png', 'image/svg+xml'] },
    general: { maxSize: 10_000_000, types: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] },
  },
} as const;

export const NOTIFICATION_TYPES = {
  // Auth
  AUTH_EMAIL_VERIFIED: 'auth.email.verified',
  AUTH_PASSWORD_CHANGED: 'auth.password.changed',

  // Portal
  PORTAL_MEMBERSHIP_APPROVED: 'portal.membership.approved',
  PORTAL_MEMBERSHIP_REJECTED: 'portal.membership.rejected',
  PORTAL_EVENT_REMINDER: 'portal.event.reminder',
  PORTAL_QUEST_ASSIGNED: 'portal.quest.assigned',

  // Grants
  GRANTS_APPLICATION_RECEIVED: 'grants.application.received',
  GRANTS_APPLICATION_STATUS: 'grants.application.status',
  GRANTS_MILESTONE_REVIEW: 'grants.milestone.review',

  // Bounty
  BOUNTY_SUBMISSION_APPROVED: 'bounty.submission.approved',
  BOUNTY_SUBMISSION_REJECTED: 'bounty.submission.rejected',
  BOUNTY_WINNER_SELECTED: 'bounty.winner.selected',

  // Ecosystem
  ECOSYSTEM_PROJECT_APPROVED: 'ecosystem.project.approved',
  ECOSYSTEM_PROJECT_REJECTED: 'ecosystem.project.rejected',

  // XP
  XP_LEVEL_UP: 'xp.level.up',
  XP_BADGE_EARNED: 'xp.badge.earned',
} as const;

export const ERROR_CODES = {
  // Auth
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  ACCOUNT_DEACTIVATED: 'ACCOUNT_DEACTIVATED',
  ACCOUNT_DELETED: 'ACCOUNT_DELETED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  REQUIRES_2FA: 'REQUIRES_2FA',

  // General
  NOT_FOUND: 'NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
