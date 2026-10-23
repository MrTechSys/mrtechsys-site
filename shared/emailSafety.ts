// shared/emailSafety.ts
/**
 * Input hygiene for the public endpoints that send email (Resend) on a visitor's behalf.
 *
 * Those endpoints are unauthenticated, so anything a caller sends must be treated as hostile: it is escaped before it
 * goes into email HTML, stripped of line breaks before it goes into a subject, length-capped, and the recipient must
 * be exactly one plain address. Provider errors are logged, never returned to the caller.
 */

export const MAX_BODY_BYTES = 64 * 1024;

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * One line of plain text, trimmed, at most `max` characters: no control characters, line or paragraph separators
 * (U+2028/2029), or bidirectional overrides (U+202A-202E, U+2066-2069) that could disguise a subject line.
 */
export function cleanText(value: unknown, max = 100): string {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029\u202a-\u202e\u2066-\u2069]+/g, ' ').trim().slice(0, max);
}

/** Exactly one address: no commas, semicolons, spaces or angle brackets (a list would send to several people). */
export function isSingleEmail(value: unknown): boolean {
  const s = String(value ?? '');
  return s.length <= 254 && /^[^\s@,;<>"']+@[^\s@,;<>"']+\.[^\s@,;<>"']+$/.test(s);
}

/** Rejects bodies over MAX_BODY_BYTES before parsing them. */
export async function readJsonBody(request: Request): Promise<any> {
  const tooLarge = () => Object.assign(new Error('Request too large'), { status: 413 });
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY_BYTES) throw tooLarge();
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    throw tooLarge();
  }
  return JSON.parse(text);
}

export const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
