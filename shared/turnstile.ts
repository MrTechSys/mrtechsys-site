// shared/turnstile.ts
/**
 * Cloudflare Turnstile check for the public forms that send email (blueprint, booking, assessment report email).
 *
 * Runs after input validation and before the rate limits (shared/rateLimit.ts), so a bot without a valid token can't
 * spend a visitor's or the site's email budget. Each token is verified once with Cloudflare (siteverify), with the
 * visitor's IP; tokens are single-use and expire after 5 minutes. Any failure refuses the request (fails closed):
 * a missing or invalid token is 403, a siteverify outage or timeout is 503.
 *
 * The secret is only ever TURNSTILE_SECRET_KEY from the environment (a Pages secret on Production); without it every
 * request is refused (503). It is never chosen by hostname: production also answers on per-deployment
 * <id>.mrtechsys-site.pages.dev URLs, which a hostname rule would have let through with a test secret. So preview
 * deployments (no secret) refuse these forms, and local development sets Cloudflare's always-pass test secret
 * explicitly in .dev.vars (TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA). With the real secret only tokens
 * issued on the production hostnames count; pages elsewhere render the test site key (src/components/TurnstileWidget.jsx),
 * whose tokens never pass the real secret.
 */

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TEST_SECRET = '1x0000000000000000000000000000000AA'; // Cloudflare's always-pass test secret (local .dev.vars only)
export const PRODUCTION_HOSTS = new Set(['mrtechsys.com', 'www.mrtechsys.com', 'mrtechsys-site.pages.dev']);

export type TurnstileResult = { ok: true } | { ok: false; response: Response };

const refuse = (status: number, error: string, message: string): TurnstileResult => ({
  ok: false,
  response: new Response(JSON.stringify({ error, message }), { status, headers: { 'Content-Type': 'application/json' } }),
});

export async function verifyTurnstile(env: { TURNSTILE_SECRET_KEY?: string }, request: Request, token: unknown): Promise<TurnstileResult> {
  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret) return refuse(503, 'VERIFICATION_UNAVAILABLE', 'This form is temporarily unavailable. Please try again shortly.');
  // The always-pass test secret is for local development only; if it were ever set as a Pages secret, the production
  // hostnames refuse rather than accept every token.
  if (secret === TEST_SECRET && PRODUCTION_HOSTS.has(new URL(request.url).hostname)) {
    console.error('[turnstile] the test secret is configured on a production hostname; refusing');
    return refuse(503, 'VERIFICATION_UNAVAILABLE', 'This form is temporarily unavailable. Please try again shortly.');
  }
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
  if (secret !== TEST_SECRET && !PRODUCTION_HOSTS.has(String(data.hostname || ''))) {
    console.warn('[turnstile] token for an unexpected hostname:', data.hostname);
    return refuse(403, 'VERIFICATION_FAILED', 'Verification failed. Please try again.');
  }
  return { ok: true };
}
