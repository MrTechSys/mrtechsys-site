// shared/rateLimit.ts
/**
 * Abuse limits for the public endpoints that send email (or have CloudFlip send email) to an address a visitor
 * typed in. Backed by rate_counters in the site's own D1 (migrations/0002_rate_counters.sql).
 *
 * Fixed windows: a counter is (bucket, window_start); every request increments all of its counters in one D1 batch
 * (a transaction), each with INSERT ... ON CONFLICT DO UPDATE ... RETURNING, so concurrent requests can't both slip
 * under a limit. A request over any limit is refused before anything is sent; it still counts (an abuser retrying
 * stays blocked). If the counters can't be written the request is refused (fails closed): sending is the abuse-
 * sensitive part, and the Cloudflare rate-limiting rule is only a coarse first layer (10 s window on the Free plan).
 *
 * Recipients are stored only as a SHA-256 of the lower-cased address, never the address itself.
 */

export interface Limit { bucket: string; limit: number; windowSec: number }
export type LimitResult = { ok: true } | { ok: false; reason: 'RATE_LIMITED' | 'LIMITER_UNAVAILABLE'; retryAfterSec: number };

// Tunable. Resend's free tier allows 100 emails a day for the whole site, and a booking sends up to three.
export const LIMITS = Object.freeze({
  perIp: { limit: 5, windowSec: 3600 },          // email-sending requests from one IP per hour
  perRecipient: { limit: 3, windowSec: 86400 },  // emails to one address per day
  global: { limit: 30, windowSec: 86400 },       // email-sending requests for the whole site per day
  bookingPerIp: { limit: 3, windowSec: 86400 },  // new bookings from one IP per day
});

const RETENTION_SEC = 2 * 86400; // longest window, twice

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const clientIp = (request: Request) => request.headers.get('CF-Connecting-IP') || 'unknown';

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
  const windows = limits.map((l) => ({ ...l, start: now - (now % l.windowSec) }));
  let results: D1Result[];
  try {
    results = await db.batch([
      ...windows.map((w) => db.prepare(`
        INSERT INTO rate_counters (bucket, window_start, count) VALUES (?, ?, 1)
        ON CONFLICT(bucket, window_start) DO UPDATE SET count = count + 1
        RETURNING count
      `).bind(w.bucket, w.start)),
      db.prepare('DELETE FROM rate_counters WHERE window_start < ?').bind(now - RETENTION_SEC),
    ]);
  } catch (err) {
    console.error('[rateLimit] counters unavailable; refusing:', err);
    return { ok: false, reason: 'LIMITER_UNAVAILABLE', retryAfterSec: 60 };
  }
  for (let i = 0; i < windows.length; i++) {
    const count = Number((results[i]?.results?.[0] as { count?: number } | undefined)?.count);
    if (!Number.isFinite(count)) return { ok: false, reason: 'LIMITER_UNAVAILABLE', retryAfterSec: 60 };
    if (count > windows[i].limit) {
      return { ok: false, reason: 'RATE_LIMITED', retryAfterSec: windows[i].start + windows[i].windowSec - now };
    }
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
