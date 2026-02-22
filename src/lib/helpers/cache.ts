import Redis from 'ioredis';

// ============================================================
// Redis Cache Layer
// ============================================================

let redis: Redis | null = null;
let redisUnavailable = false;

function getRedis(): Redis | null {
  if (redisUnavailable) return null;
  if (!redis) {
    const url = process.env.REDIS_URL;
    if (!url) {
      redisUnavailable = true;
      return null;
    }
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          redisUnavailable = true;
          return null;
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redis.on('error', () => {
      redisUnavailable = true;
    });
  }
  return redis;
}

export const cache = {
  async get<T = string>(key: string): Promise<T | null> {
    const r = getRedis();
    if (!r) return null;
    try {
      const value = await r.get(key);
      if (!value) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const r = getRedis();
    if (!r) return;
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      if (ttlSeconds) {
        await r.setex(key, ttlSeconds, serialized);
      } else {
        await r.set(key, serialized);
      }
    } catch {
      // silent
    }
  },

  async del(key: string): Promise<void> {
    const r = getRedis();
    if (!r) return;
    try {
      await r.del(key);
    } catch {
      // silent
    }
  },

  async invalidatePattern(pattern: string): Promise<void> {
    const r = getRedis();
    if (!r) return;
    try {
      const keys = await r.keys(pattern);
      if (keys.length > 0) {
        await r.del(...keys);
      }
    } catch {
      // silent
    }
  },

  async increment(key: string, ttlSeconds?: number): Promise<number> {
    const r = getRedis();
    if (!r) return 0;
    try {
      const count = await r.incr(key);
      if (count === 1 && ttlSeconds) {
        await r.expire(key, ttlSeconds);
      }
      return count;
    } catch {
      return 0;
    }
  },

  async getTTL(key: string): Promise<number> {
    const r = getRedis();
    if (!r) return -1;
    try {
      return await r.ttl(key);
    } catch {
      return -1;
    }
  },
};
