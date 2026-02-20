import { ERROR_CODES } from '@/lib/config/constants';

type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = ERROR_STATUS_MAP[code] || 500;
    this.details = details;
  }
}

const ERROR_STATUS_MAP: Record<string, number> = {
  [ERROR_CODES.INVALID_CREDENTIALS]: 401,
  [ERROR_CODES.UNAUTHORIZED]: 401,
  [ERROR_CODES.TOKEN_EXPIRED]: 401,
  [ERROR_CODES.TOKEN_INVALID]: 401,
  [ERROR_CODES.REQUIRES_2FA]: 403,
  [ERROR_CODES.FORBIDDEN]: 403,
  [ERROR_CODES.EMAIL_NOT_VERIFIED]: 403,
  [ERROR_CODES.ACCOUNT_DEACTIVATED]: 403,
  [ERROR_CODES.ACCOUNT_DELETED]: 403,
  [ERROR_CODES.NOT_FOUND]: 404,
  [ERROR_CODES.CONFLICT]: 409,
  [ERROR_CODES.VALIDATION_ERROR]: 422,
  [ERROR_CODES.RATE_LIMITED]: 429,
  [ERROR_CODES.INTERNAL_ERROR]: 500,
};

export function getErrorStatusCode(code: string): number {
  return ERROR_STATUS_MAP[code] || 500;
}
