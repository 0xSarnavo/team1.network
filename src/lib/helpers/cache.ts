import Redis from 'ioredis';

// ============================================================
// Redis Cache Layer
// ============================================================

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redis.on('error', (err) => {
      console.error('Redis connection error:', err.message);
    });
  }
  return redis;
}

export const cache = {
  async get<T = string>(key: string): Promise<T | null> {
    try {
      const value = await getRedis().get(key);
      if (!value) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch {
      console.warn('Cache get failed for key:', key);
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      if (ttlSeconds) {
        await getRedis().setex(key, ttlSeconds, serialized);
      } else {
        await getRedis().set(key, serialized);
      }
    } catch {
      console.warn('Cache set failed for key:', key);
    }
  },

  async del(key: string): Promise<void> {
    try {
      await getRedis().del(key);
    } catch {
      console.warn('Cache del failed for key:', key);
    }
  },

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await getRedis().keys(pattern);
      if (keys.length > 0) {
        await getRedis().del(...keys);
      }
    } catch {
      console.warn('Cache invalidate pattern failed:', pattern);
    }
  },

  async increment(key: string, ttlSeconds?: number): Promise<number> {
    try {
      const r = getRedis();
      const count = await r.incr(key);
      if (count === 1 && ttlSeconds) {
        await r.expire(key, ttlSeconds);
      }
      return count;
    } catch {
      console.warn('Cache increment failed for key:', key);
      return 0;
    }
  },

  async getTTL(key: string): Promise<number> {
    try {
      return await getRedis().ttl(key);
    } catch {
      return -1;
    }
  },
};
