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

/** One line of plain text: no control characters or line breaks, trimmed, at most `max` characters. */
export function cleanText(value: unknown, max = 100): string {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max);
}

/** Exactly one address: no commas, semicolons, spaces or angle brackets (a list would send to several people). */
export function isSingleEmail(value: unknown): boolean {
  const s = String(value ?? '');
  return s.length <= 254 && /^[^\s@,;<>"']+@[^\s@,;<>"']+\.[^\s@,;<>"']+$/.test(s);
}

/** Rejects bodies over MAX_BODY_BYTES before parsing them. */
export async function readJsonBody(request: Request): Promise<any> {
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    throw Object.assign(new Error('Request too large'), { status: 413 });
  }
  return JSON.parse(text);
}

export const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
