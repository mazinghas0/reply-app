import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { NextRequest } from "next/server";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

interface RateLimitConfig {
  authenticatedLimit: number;
  anonymousLimit: number;
  prefix: string;
}

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

function createLimiter(prefix: string, limit: number): Ratelimit {
  return new Ratelimit({
    redis: getRedis()!,
    limiter: Ratelimit.fixedWindow(limit, "1 d"),
    prefix: `ratelimit:${prefix}`,
  });
}

// 메모리 폴백 (Upstash 미설정 시)
const fallbackMap = new Map<string, { count: number; resetAt: number }>();
const DAY_MS = 24 * 60 * 60 * 1000;

function fallbackCheck(key: string, limit: number): RateLimitResult {
  const now = Date.now();
  const record = fallbackMap.get(key);
  if (!record || now > record.resetAt) {
    fallbackMap.set(key, { count: 1, resetAt: now + DAY_MS });
    return { allowed: true, remaining: limit - 1 };
  }
  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }
  record.count += 1;
  return { allowed: true, remaining: limit - record.count };
}

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

const IP_DAILY_LIMIT = 15;

export async function checkRateLimit(
  request: NextRequest,
  userId: string | null,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const clientIp = getClientIp(request);
  const r = getRedis();

  // Upstash 미설정 시 메모리 폴백
  if (!r) {
    const key = userId ?? clientIp;
    const limit = userId ? config.authenticatedLimit : config.anonymousLimit;
    return fallbackCheck(`${config.prefix}:${key}`, limit);
  }

  // 1차: IP 기반 제한 (계정을 바꿔도 같은 기기면 15건 제한)
  const ipLimiter = createLimiter(`${config.prefix}:ip`, IP_DAILY_LIMIT);
  const ipResult = await ipLimiter.limit(clientIp);
  if (!ipResult.success) {
    return { allowed: false, remaining: 0 };
  }

  // 2차: 사용자/IP 기반 제한 (로그인 10건, 비로그인 5건)
  const userKey = userId ?? `anon:${clientIp}`;
  const userLimit = userId ? config.authenticatedLimit : config.anonymousLimit;
  const userLimiter = createLimiter(`${config.prefix}:user`, userLimit);
  const userResult = await userLimiter.limit(userKey);

  return {
    allowed: userResult.success,
    remaining: userResult.remaining,
  };
}
