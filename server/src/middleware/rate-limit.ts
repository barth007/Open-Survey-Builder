import type { NextFunction, Request, Response } from 'express';

interface RateLimitOptions {
  keyPrefix: string;
  maxRequests: number;
  message?: string;
  windowMs: number;
}

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitBucket>();

const getClientKey = (req: Request) => req.ip || req.socket.remoteAddress || 'unknown';

export const createRateLimitMiddleware = ({
  keyPrefix,
  maxRequests,
  message = 'Too many requests',
  windowMs,
}: RateLimitOptions) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const now = Date.now();
  const key = `${keyPrefix}:${getClientKey(req)}`;
  const currentBucket = buckets.get(key);

  if (!currentBucket || currentBucket.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    next();
    return;
  }

  currentBucket.count += 1;
  buckets.set(key, currentBucket);

  if (currentBucket.count > maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((currentBucket.resetAt - now) / 1000));
    res.setHeader('Retry-After', String(retryAfterSeconds));
    res.status(429).json({ message });
    return;
  }

  next();
};
