import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/helpers/cache';
import { apiError } from '@/lib/helpers/api-response';
import { AppError } from '@/lib/helpers/errors';

// ============================================================
// Rate Limiting Middleware
// ============================================================

interface RateLimitConfig {
  max: number;
  windowSeconds: number;
  keyPrefix?: string;
}

/**
 * Extract client identifier for rate limiting.
 */
function getClientIdentifier(req: NextRequest, keyOverride?: string): string {
  if (keyOverride) return keyOverride;
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  return ip;
}

/**
 * Rate limit check. Returns remaining count and reset time.
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const key = `ratelimit:${config.keyPrefix || 'default'}:${identifier}`;

  const count = await cache.increment(key, config.windowSeconds);
  const ttl = await cache.getTTL(key);

  return {
    allowed: count <= config.max,
    remaining: Math.max(0, config.max - count),
    resetIn: ttl > 0 ? ttl : config.windowSeconds,
  };
}

/**
 * Higher-order function to wrap a route handler with rate limiting.
 */
export function withRateLimit(config: RateLimitConfig, keyExtractor?: (req: NextRequest) => string) {
  return function (handler: (req: NextRequest, context: unknown) => Promise<NextResponse>) {
    return async function (req: NextRequest, context: unknown): Promise<NextResponse> {
      const identifier = keyExtractor ? keyExtractor(req) : getClientIdentifier(req);
      const result = await checkRateLimit(identifier, config);

      if (!result.allowed) {
        const minutes = Math.ceil(result.resetIn / 60);
        return apiError(
          new AppError('RATE_LIMITED', `Too many requests. Try again in ${minutes} minute(s).`)
        );
      }

      const response = await handler(req, context);

      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', config.max.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.resetIn.toString());

      return response;
    };
  };
}
