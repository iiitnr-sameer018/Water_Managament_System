/**
 * RATE LIMITER — Client-side API abuse prevention
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store: Map<string, RateLimitEntry> = new Map();

const LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
    'complaint_submit': { maxRequests: 3, windowMs: 3600000 },    // 3 per hour
    'login_attempt': { maxRequests: 5, windowMs: 300000 },         // 5 per 5 min
    'rating_submit': { maxRequests: 10, windowMs: 3600000 },       // 10 per hour
    'general': { maxRequests: 60, windowMs: 60000 },               // 60 per min
};

export const checkRateLimit = (userId: string, action: string): { allowed: boolean; remaining: number; resetIn: number } => {
    const key = `${userId}:${action}`;
    const config = LIMITS[action] || LIMITS['general'];
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + config.windowMs });
        return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
    }

    if (entry.count >= config.maxRequests) {
        return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
    }

    entry.count++;
    return { allowed: true, remaining: config.maxRequests - entry.count, resetIn: entry.resetAt - now };
};

export const getRateLimitStatus = (userId: string, action: string) => {
    const key = `${userId}:${action}`;
    const config = LIMITS[action] || LIMITS['general'];
    const entry = store.get(key);
    if (!entry || Date.now() > entry.resetAt) return { used: 0, max: config.maxRequests, resetIn: 0 };
    return { used: entry.count, max: config.maxRequests, resetIn: entry.resetAt - Date.now() };
};
