// shared/rateLimit.ts
/**
 * Abuse limits for the public endpoints that send email (or have CloudFlip send email) to an address a visitor
 * typed in. Backed by rate_counters in the site's own D1 (migrations/0002_rate_counters.sql).
 *
 * Fixed windows: a counter is (bucket, window_start). A request's counters are charged one at a time, in order (the
 * narrowest first: per IP, then per recipient, then site-wide), each with a single conditional upsert that adds 1 only
 * while the counter is below its limit, so concurrent requests can't both slip under it. The first counter that is
 * full refuses the request and the later ones are not charged: a blocked IP never spends the site-wide budget. (A
 * request refused by a later counter has already used its place in the earlier ones, which only errs on the strict
 * side.) If a counter can't be written the request is refused (fails closed): sending is the abuse-sensitive part, and
 * the Cloudflare rate-limiting rule is only a coarse first layer (10 s window on the Free plan).
 *
 * Many IPs together can still use up the site-wide cap; that is the intended trade-off protecting the Resend quota.
 *
 * Recipients are stored only as a SHA-256 of the lower-cased address, never the address itself.
 */

export interface Limit { bucket: string; limit: number; windowSec: number }
export type LimitResult = { ok: true } | { ok: false; reason: 'RATE_LIMITED' | 'LIMITER_UNAVAILABLE'; retryAfterSec: number };

// Tunable. Limits count requests, not emails: a booking sends up to three (two to the visitor, or one plus a CloudFlip
// sign-in code, and the owner alert); the assessment report also blind-copies the owner. Resend's free tier allows
// 100 emails a day for the whole site, so 30 requests stays under it.
export const LIMITS = Object.freeze({
  perIp: { limit: 5, windowSec: 3600 },          // email-sending requests from one IP (or IPv6 /64) per hour
  perRecipient: { limit: 3, windowSec: 86400 },  // email-sending requests to one address per day (up to 2 emails each)
  global: { limit: 30, windowSec: 86400 },       // email-sending requests for the whole site per day
  bookingPerIp: { limit: 3, windowSec: 86400 },  // new bookings from one IP (or IPv6 /64) per day
});

const RETENTION_SEC = 2 * 86400; // longest window, twice

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// CF-Connecting-IP is set by Cloudflare (not spoofable through the edge). An IPv6 client is counted by its /64, since
// one connection usually owns the whole prefix and could otherwise rotate addresses within it.
export const clientIp = (request: Request) => {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const mapped = ip.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i); // IPv4-mapped IPv6 counts as its IPv4
  if (mapped) return mapped[1];
  if (!ip.includes(':')) return ip;
  const [head, tail = ''] = ip.split('::');
  const left = head ? head.split(':') : [];
  const right = tail ? tail.split(':') : [];
  const groups = ip.includes('::') ? [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill('0'), ...right] : left;
  return `${groups.slice(0, 4).map((g) => g.toLowerCase().replace(/^0+(?=.)/, '')).join(':')}::/64`;
};

/** The counters for one email-sending request: per IP, per recipient and site-wide, for `kind` (e.g. 'blueprint'). */
export async function emailLimits(request: Request, recipient: string): Promise<Limit[]> {
  const to = await sha256Hex(String(recipient).trim().toLowerCase());
  return [
    { bucket: `email:ip:${clientIp(request)}`, ...LIMITS.perIp },
    { bucket: `email:to:${to}`, ...LIMITS.perRecipient },
    { bucket: 'email:global', ...LIMITS.global },
  ];
}

export async function consumeLimits(db: D1Database | undefined, limits: Limit[], now = Math.floor(Date.now() / 1000)): Promise<LimitResult> {
  if (!db || !limits.length) return { ok: false, reason: 'LIMITER_UNAVAILABLE', retryAfterSec: 60 };
  try {
    for (const l of limits) {
      const start = now - (now % l.windowSec);
      // Adds 1 only while below the limit; a full counter updates nothing and returns no row.
      const row = await db.prepare(`
        INSERT INTO rate_counters (bucket, window_start, count) VALUES (?, ?, 1)
        ON CONFLICT(bucket, window_start) DO UPDATE SET count = count + 1 WHERE count < ?
        RETURNING count
      `).bind(l.bucket, start, l.limit).first<{ count: number }>();
      if (!row) return { ok: false, reason: 'RATE_LIMITED', retryAfterSec: start + l.windowSec - now };
      if (!Number.isFinite(Number(row.count))) return { ok: false, reason: 'LIMITER_UNAVAILABLE', retryAfterSec: 60 };
    }
    // Housekeeping; not part of the decision.
    await db.prepare('DELETE FROM rate_counters WHERE window_start < ?').bind(now - RETENTION_SEC).run().catch(() => {});
  } catch (err) {
    console.error('[rateLimit] counters unavailable; refusing:', err);
    return { ok: false, reason: 'LIMITER_UNAVAILABLE', retryAfterSec: 60 };
  }
  return { ok: true };
}

/** The response for a refused request (429 over a limit, 503 when the counters can't be written). */
export function limitResponse(result: Exclude<LimitResult, { ok: true }>): Response {
  const limited = result.reason === 'RATE_LIMITED';
  return new Response(JSON.stringify({
    error: result.reason,
    message: limited ? 'Too many requests. Please try again later.' : 'This form is temporarily unavailable. Please try again shortly.',
  }), {
    status: limited ? 429 : 503,
    headers: { 'Content-Type': 'application/json', 'Retry-After': String(Math.max(1, result.retryAfterSec)) },
  });
}
