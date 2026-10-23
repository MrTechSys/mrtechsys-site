// functions/api/booking-cancel.ts
// GET /api/booking-cancel?id=BOOKING_ID&token=CANCEL_TOKEN

import { cleanText, escapeHtml } from '../../shared/emailSafety';

interface Env {
  DB?: D1Database;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const bookingId = url.searchParams.get('id');
  const token = url.searchParams.get('token');

  if (!bookingId || !token) {
    return new Response('<html><body style="font-family:sans-serif;text-align:center;padding:40px;background:#07090E;color:#fff;"><h2 style="color:#ef4444;">Invalid cancellation link.</h2></body></html>', { status: 400, headers: { 'Content-Type': 'text/html' } });
  }

  if (!env.DB) {
    return new Response('<html><body style="font-family:sans-serif;text-align:center;padding:40px;background:#07090E;color:#fff;"><h2 style="color:#ef4444;">Database unavailable. Please try again later.</h2></body></html>', { status: 503, headers: { 'Content-Type': 'text/html' } });
  }

  const booking = await env.DB.prepare(
    "SELECT id, name, email, booking_date, booking_time, cancel_token, status FROM bookings WHERE id = ? AND cancel_token = ?"
  ).bind(bookingId, token).first() as any;

  if (!booking) {
    return new Response('<html><body style="font-family:sans-serif;text-align:center;padding:40px;background:#07090E;color:#fff;"><h2 style="color:#ef4444;">Booking not found or link already used.</h2></body></html>', { status: 404, headers: { 'Content-Type': 'text/html' } });
  }

  if (booking.status === 'cancelled') {
    return new Response(`<html><body style="font-family:sans-serif;text-align:center;padding:40px;background:#07090E;color:#E2E8F0;"><h2 style="color:#D4AF37;">Already Cancelled</h2><p>This booking was already cancelled.</p><a href="https://mrtechsys.com" style="color:#D4AF37;">Return to MrTechSys.com</a></body></html>`, { status: 200, headers: { 'Content-Type': 'text/html' } });
  }

  // Cancel it
  await env.DB.prepare(
    "UPDATE bookings SET status = 'cancelled', cancelled_at = ?, cancel_token = NULL WHERE id = ?"
  ).bind(new Date().toISOString(), bookingId).run();

  // Send brief cancellation confirmation to user
  if (env.RESEND_API_KEY) {
    const from = env.RESEND_FROM_EMAIL || 'notifications@mrtechsys.com';
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.RESEND_API_KEY}` },
      body: JSON.stringify({
        from: `MrTechSys <${from}>`,
        to: [booking.email],
        subject: `Booking Cancelled — ${cleanText(booking.booking_date, 10)}`,
        html: `<div style="font-family:sans-serif;padding:24px;background:#07090E;color:#E2E8F0;"><h2 style="color:#D4AF37;">Booking Cancelled</h2><p>Hi ${escapeHtml(String(booking.name || '').split(' ')[0] || 'there')},</p><p>Your booking on <strong>${escapeHtml(booking.booking_date)}</strong> at <strong>${escapeHtml(booking.booking_time)} CST</strong> has been cancelled as requested.</p><p>Whenever you're ready to reschedule, we'd love to connect: <a href="https://mrtechsys.com/book" style="color:#D4AF37;">mrtechsys.com/book</a></p></div>`
      })
    }).catch(() => {});
  }

  return new Response(`
<html>
<head><meta charset="utf-8"><title>Booking Cancelled</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;text-align:center;padding:60px 20px;background:#07090E;color:#E2E8F0;">
  <div style="max-width:500px;margin:0 auto;background:#0B0F17;border-radius:12px;border:1px solid rgba(212,175,55,0.3);padding:40px;">
    <div style="font-size:48px;margin-bottom:16px;">✓</div>
    <h2 style="color:#D4AF37;margin:0 0 12px;">Booking Cancelled</h2>
    <p style="color:#94A3B8;font-size:14px;line-height:1.6;">Your session on <strong style="color:#fff;">${escapeHtml(booking.booking_date)}</strong> has been cancelled. We hope to connect again when the timing is right.</p>
    <a href="https://mrtechsys.com" style="display:inline-block;margin-top:24px;background:linear-gradient(135deg,#D4AF37,#EAB308);color:#07090E;font-weight:bold;font-family:monospace;font-size:12px;text-decoration:none;padding:12px 24px;border-radius:8px;text-transform:uppercase;letter-spacing:1px;">Return to MrTechSys.com</a>
  </div>
</body>
</html>`, { status: 200, headers: { 'Content-Type': 'text/html' } });
};
