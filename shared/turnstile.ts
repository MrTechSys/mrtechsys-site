// shared/turnstile.ts
/**
 * Cloudflare Turnstile check for the public forms that send email (blueprint, booking, assessment report email).
 *
 * Runs after input validation and before the rate limits (shared/rateLimit.ts), so a bot without a valid token can't
 * spend a visitor's or the site's email budget. Each token is verified once with Cloudflare (siteverify), with the
 * visitor's IP; tokens are single-use and expire after 5 minutes. Any failure refuses the request (fails closed):
 * a missing or invalid token is 403, a siteverify outage or timeout is 503.
 *
 * Production uses TURNSTILE_SECRET_KEY (a Pages secret) and accepts only tokens issued on the production hostnames.
 * Preview and local builds, which have no secret, use Cloudflare's documented always-pass test secret; their pages
 * render the matching test site key (src/components/TurnstileWidget.jsx). A test-key token never passes the real secret.
 */

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TEST_SECRET = '1x0000000000000000000000000000000AA'; // Cloudflare's always-pass test secret
export const PRODUCTION_HOSTS = new Set(['mrtechsys.com', 'www.mrtechsys.com', 'mrtechsys-site.pages.dev']);

export type TurnstileResult = { ok: true } | { ok: false; response: Response };

const refuse = (status: number, error: string, message: string): TurnstileResult => ({
  ok: false,
  response: new Response(JSON.stringify({ error, message }), { status, headers: { 'Content-Type': 'application/json' } }),
});

export async function verifyTurnstile(env: { TURNSTILE_SECRET_KEY?: string }, request: Request, token: unknown): Promise<TurnstileResult> {
  const host = new URL(request.url).hostname;
  const secret = env.TURNSTILE_SECRET_KEY || (PRODUCTION_HOSTS.has(host) ? '' : TEST_SECRET);
  if (!secret) return refuse(503, 'VERIFICATION_UNAVAILABLE', 'This form is temporarily unavailable. Please try again shortly.');
  if (typeof token !== 'string' || !token || token.length > 2048) {
    return refuse(403, 'VERIFICATION_REQUIRED', 'Please complete the verification and try again.');
  }

  let data: { success?: boolean; hostname?: string; 'error-codes'?: string[] };
  try {
    const body = new FormData();
    body.append('secret', secret);
    body.append('response', token);
    const ip = request.headers.get('CF-Connecting-IP');
    if (ip) body.append('remoteip', ip);
    const res = await fetch(SITEVERIFY, { method: 'POST', body, signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`siteverify HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    console.error('[turnstile] siteverify unavailable; refusing:', err);
    return refuse(503, 'VERIFICATION_UNAVAILABLE', 'This form is temporarily unavailable. Please try again shortly.');
  }

  if (data.success !== true) {
    console.warn('[turnstile] token refused:', (data['error-codes'] || []).join(','));
    return refuse(403, 'VERIFICATION_FAILED', 'Verification failed. Please try again.');
  }
  // With the real secret, only tokens issued on the production site count (not one solved on another site's widget).
  if (env.TURNSTILE_SECRET_KEY && !PRODUCTION_HOSTS.has(String(data.hostname || ''))) {
    console.warn('[turnstile] token for an unexpected hostname:', data.hostname);
    return refuse(403, 'VERIFICATION_FAILED', 'Verification failed. Please try again.');
  }
  return { ok: true };
}
