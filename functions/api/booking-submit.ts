// functions/api/booking-submit.ts
// POST /api/booking-submit

interface Env {
  DB?: D1Database;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  OWNER_ALERT_EMAIL?: string;
  CLOUDFLIP_PROVISION_SECRET?: string;
  ZOOM_MEETING_URL?: string;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

// Buy-in signal detection: checks AI plan text and service type for intent
function detectBuyIn(payload: any): boolean {
  const signals = [
    'cloudflip', 'sign up', 'ready to start', 'onboard', 'get started',
    'workspace', 'platform', 'trial', 'activate', 'deploy now', 'automate my',
    'let\'s do it', 'move forward', 'set it up'
  ];
  const text = [
    payload.aiPlanSummary || '',
    payload.problemSummary || '',
    payload.serviceType || ''
  ].join(' ').toLowerCase();
  return signals.some(s => text.includes(s));
}

function meetingLinkForType(type: string, zoomUrl?: string): string {
  switch (type) {
    case 'zoom': return zoomUrl || 'https://zoom.us/j/mrtechsys';
    case 'google_meet': return 'https://meet.google.com/mrtechsys';
    case 'cloudflip_live': return 'https://cloudflip.mrtechsys.com/live';
    case 'phone': return '';
    default: return zoomUrl || 'https://zoom.us/j/mrtechsys';
  }
}

function formatBookingDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime12(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm} CST`;
}

async function sendUserConfirmation(env: Env, payload: any, bookingId: string, meetingLink: string) {
  if (!env.RESEND_API_KEY) return false;
  const from = env.RESEND_FROM_EMAIL || 'notifications@mrtechsys.com';
  const firstName = payload.name?.split(' ')[0] || 'there';
  const cancelLink = `https://mrtechsys.com/api/booking-cancel?id=${bookingId}&token=${payload._cancelToken}`;
  const meetingSection = meetingLink
    ? `<div style="margin:20px 0;padding:18px;background:#0E131F;border-radius:8px;border:1px solid rgba(212,175,55,0.3);text-align:center;">
        <p style="color:#94A3B8;font-size:12px;margin:0 0 10px;">Meeting Link</p>
        <a href="${meetingLink}" style="color:#D4AF37;font-family:monospace;font-size:13px;font-weight:bold;text-decoration:none;">${meetingLink}</a>
       </div>`
    : `<div style="margin:20px 0;padding:18px;background:#0E131F;border-radius:8px;border:1px solid rgba(212,175,55,0.3);">
        <p style="color:#94A3B8;font-size:12px;margin:0;">Meeting type: <strong style="color:#fff;">Phone Call</strong>. MrTechSys will call you at the number provided.</p>
       </div>`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;background:#07090E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#E2E8F0;">
<table style="max-width:650px;margin:0 auto;background:#0B0F17;border-radius:12px;border:1px solid rgba(212,175,55,0.35);padding:32px;">
<tr><td>
  <div style="border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:16px;margin-bottom:24px;">
    <span style="font-family:monospace;font-size:11px;color:#D4AF37;letter-spacing:1.5px;text-transform:uppercase;font-weight:bold;">⚡ MRTECHSYS · BOOKING CONFIRMED</span>
    <h1 style="color:#fff;font-size:22px;margin:8px 0 4px;font-weight:800;">Your Strategy Session is Locked In</h1>
    <p style="color:#94A3B8;font-size:13px;margin:0;">Prepared for <strong>${payload.businessName || payload.name}</strong></p>
  </div>
  <p style="font-size:14px;color:#CBD5E1;line-height:1.6;">Howdy ${firstName},</p>
  <p style="font-size:14px;color:#CBD5E1;line-height:1.6;">Your MrTechSys strategy session is confirmed. Here are your booking details:</p>
  <div style="background:#121824;border-left:3px solid #D4AF37;padding:14px 18px;margin:20px 0;border-radius:0 8px 8px 0;">
    <div style="font-size:12px;font-family:monospace;color:#94A3B8;">DATE: <span style="color:#fff;font-weight:bold;">${formatBookingDate(payload.bookingDate)}</span></div>
    <div style="font-size:12px;font-family:monospace;color:#94A3B8;margin-top:4px;">TIME: <span style="color:#D4AF37;font-weight:bold;">${formatTime12(payload.bookingTime)}</span></div>
    <div style="font-size:12px;font-family:monospace;color:#94A3B8;margin-top:4px;">DURATION: <span style="color:#fff;font-weight:bold;">${payload.duration || 60} minutes</span></div>
    <div style="font-size:12px;font-family:monospace;color:#94A3B8;margin-top:4px;">TOPIC: <span style="color:#fff;font-weight:bold;">${payload.serviceType || 'Strategy Consultation'}</span></div>
  </div>
  ${meetingSection}
  <div style="margin:24px 0;padding:18px;background:#0E131F;border-radius:8px;border:1px solid rgba(255,255,255,0.08);">
    <h4 style="color:#D4AF37;margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">What to Expect</h4>
    <p style="color:#94A3B8;font-size:12px;margin:0;line-height:1.6;">We'll review your situation, walk through your AI-generated architecture plan, and map out clear next steps — with zero pressure, zero vendor lock-in, and a focus on your specific business goals.</p>
  </div>
  <div style="margin-top:24px;text-align:center;">
    <a href="${cancelLink}" style="font-size:11px;color:#64748B;font-family:monospace;text-decoration:underline;">Need to cancel? Click here.</a>
  </div>
  <div style="margin-top:28px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);padding-top:16px;">
    <p style="font-size:11px;color:#64748B;font-family:monospace;margin:0;">MrTechSys Digital Transformation Ecosystem · Texas-Rooted Simplicity · Free First, Scale Smart</p>
  </div>
</td></tr>
</table>
</body></html>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.RESEND_API_KEY}` },
    body: JSON.stringify({ from: `MrTechSys <${from}>`, to: [payload.email], subject: `✅ Booking Confirmed: ${formatBookingDate(payload.bookingDate)} at ${formatTime12(payload.bookingTime)}`, html })
  });
  return res.ok;
}

async function sendOwnerAlert(env: Env, payload: any, bookingId: string) {
  if (!env.RESEND_API_KEY || !env.OWNER_ALERT_EMAIL) return false;
  const from = env.RESEND_FROM_EMAIL || 'notifications@mrtechsys.com';
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;background:#07090E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#E2E8F0;">
<table style="max-width:650px;margin:0 auto;background:#0B0F17;border-radius:12px;border:1px solid rgba(212,175,55,0.35);padding:32px;">
<tr><td>
  <span style="font-family:monospace;font-size:11px;color:#D4AF37;letter-spacing:1.5px;text-transform:uppercase;font-weight:bold;">🔔 NEW BOOKING ALERT</span>
  <h2 style="color:#fff;font-size:20px;margin:8px 0 4px;">New Strategy Session Booked</h2>
  <div style="background:#121824;border-left:3px solid #D4AF37;padding:14px 18px;margin:20px 0;border-radius:0 8px 8px 0;">
    <div style="font-size:12px;font-family:monospace;color:#94A3B8;">BOOKING ID: <span style="color:#fff;">${bookingId}</span></div>
    <div style="font-size:12px;font-family:monospace;color:#94A3B8;margin-top:4px;">NAME: <span style="color:#fff;font-weight:bold;">${payload.name}</span></div>
    <div style="font-size:12px;font-family:monospace;color:#94A3B8;margin-top:4px;">EMAIL: <span style="color:#D4AF37;">${payload.email}</span></div>
    <div style="font-size:12px;font-family:monospace;color:#94A3B8;margin-top:4px;">BUSINESS: <span style="color:#fff;">${payload.businessName || 'N/A'}</span></div>
    <div style="font-size:12px;font-family:monospace;color:#94A3B8;margin-top:4px;">PHONE: <span style="color:#fff;">${payload.phone || 'Not provided'}</span></div>
    <div style="font-size:12px;font-family:monospace;color:#94A3B8;margin-top:8px;border-top:1px solid rgba(255,255,255,0.06);padding-top:8px;">DATE/TIME: <span style="color:#D4AF37;font-weight:bold;">${formatBookingDate(payload.bookingDate)} at ${formatTime12(payload.bookingTime)}</span></div>
    <div style="font-size:12px;font-family:monospace;color:#94A3B8;margin-top:4px;">SERVICE: <span style="color:#fff;">${payload.serviceType || 'General'}</span></div>
    <div style="font-size:12px;font-family:monospace;color:#94A3B8;margin-top:4px;">INDUSTRY: <span style="color:#fff;">${payload.industry || 'N/A'}</span></div>
    <div style="font-size:12px;font-family:monospace;color:#94A3B8;margin-top:4px;">BUDGET: <span style="color:#fff;">${payload.budgetRange || 'N/A'}</span></div>
    <div style="font-size:12px;font-family:monospace;color:#94A3B8;margin-top:4px;">TIMELINE: <span style="color:#fff;">${payload.timeline || 'N/A'}</span></div>
    <div style="font-size:12px;font-family:monospace;color:#94A3B8;margin-top:4px;">BUY-IN DETECTED: <span style="color:${payload._buyInDetected ? '#10B981' : '#94A3B8'};font-weight:bold;">${payload._buyInDetected ? 'YES → CloudFlip OTP dispatched' : 'NO → CloudFlip invite link sent'}</span></div>
  </div>
  <div style="background:#0E131F;border-radius:8px;padding:14px 18px;margin-top:8px;">
    <h4 style="color:#D4AF37;margin:0 0 8px;font-size:12px;">PROBLEM SUMMARY:</h4>
    <p style="color:#CBD5E1;font-size:12px;margin:0;line-height:1.6;">${payload.problemSummary || 'Not provided'}</p>
  </div>
  <div style="background:#0E131F;border-radius:8px;padding:14px 18px;margin-top:8px;">
    <h4 style="color:#D4AF37;margin:0 0 8px;font-size:12px;">AI PLAN SHOWN TO USER:</h4>
    <p style="color:#CBD5E1;font-size:12px;margin:0;line-height:1.6;white-space:pre-wrap;">${payload.aiPlanSummary || 'Not captured'}</p>
  </div>
</td></tr>
</table>
</body></html>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.RESEND_API_KEY}` },
    body: JSON.stringify({ from: `MrTechSys Bookings <${from}>`, to: [env.OWNER_ALERT_EMAIL], subject: `🔔 New Booking: ${payload.name} — ${formatBookingDate(payload.bookingDate)} @ ${formatTime12(payload.bookingTime)}`, html })
  });
  return res.ok;
}

async function sendCloudFlipInvite(env: Env, payload: any) {
  if (!env.RESEND_API_KEY) return false;
  const from = env.RESEND_FROM_EMAIL || 'notifications@mrtechsys.com';
  const firstName = payload.name?.split(' ')[0] || 'there';
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;background:#07090E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#E2E8F0;">
<table style="max-width:650px;margin:0 auto;background:#0B0F17;border-radius:12px;border:1px solid rgba(212,175,55,0.35);padding:32px;">
<tr><td>
  <span style="font-family:monospace;font-size:11px;color:#D4AF37;letter-spacing:1.5px;text-transform:uppercase;font-weight:bold;">⚡ CLOUDFLIP OS</span>
  <h2 style="color:#fff;font-size:20px;margin:8px 0 12px;">Your Free Workspace is Ready When You Are</h2>
  <p style="font-size:14px;color:#CBD5E1;line-height:1.6;">Hey ${firstName},</p>
  <p style="font-size:14px;color:#CBD5E1;line-height:1.6;">As a follow-up to your upcoming strategy session, I wanted to let you know that a CloudFlip OS workspace is available to you — completely free to start. No pressure at all.</p>
  <p style="font-size:14px;color:#CBD5E1;line-height:1.6;">If you're curious to explore before we meet, you can activate your workspace at any time:</p>
  <div style="text-align:center;margin:28px 0;">
    <a href="https://cloudflip.mrtechsys.com" style="display:inline-block;background:linear-gradient(135deg,#D4AF37,#EAB308);color:#07090E;font-weight:bold;font-family:monospace;font-size:12px;text-decoration:none;padding:14px 28px;border-radius:8px;text-transform:uppercase;letter-spacing:1px;">
      Explore CloudFlip OS (Free) →
    </a>
  </div>
  <p style="font-size:12px;color:#64748B;line-height:1.6;">No obligation. You can sign up with this same email address (${payload.email}) and everything will be ready for our session. Or simply show up and we'll set it up together — whatever works best for you.</p>
  <div style="margin-top:28px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);padding-top:16px;">
    <p style="font-size:11px;color:#64748B;font-family:monospace;margin:0;">MrTechSys Digital Transformation · Texas-Rooted Simplicity · Free First, Scale Smart</p>
  </div>
</td></tr>
</table>
</body></html>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.RESEND_API_KEY}` },
    body: JSON.stringify({ from: `MrTechSys <${from}>`, to: [payload.email], subject: `Your CloudFlip OS workspace is ready (no rush)`, html })
  });
  return res.ok;
}

async function triggerCloudFlipOTP(env: Env, payload: any, bookingId: string): Promise<boolean> {
  if (!env.CLOUDFLIP_PROVISION_SECRET) return false;
  try {
    const res = await fetch('https://cloudflip.mrtechsys.com/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Provision-Token': env.CLOUDFLIP_PROVISION_SECRET
      },
      body: JSON.stringify({
        email: payload.email,
        businessName: payload.businessName || payload.name,
        vertical: payload.industry || 'professional',
        _bypass_turnstile: true,
        _booking_id: bookingId,
        hp_company_website: '',
        honeypot: ''
      })
    });
    return res.ok;
  } catch (err) {
    console.warn('[booking→cloudflip OTP] Non-blocking error:', err);
    return false;
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  if (!env.DB) return json({ error: 'Database unavailable.' }, 503);

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  // Required field validation
  const required = ['name', 'email', 'bookingDate', 'bookingTime'];
  for (const f of required) {
    if (!payload[f]) return json({ error: `Missing required field: ${f}` }, 400);
  }

  // Email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return json({ error: 'Invalid email address.' }, 400);
  }

  // Date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.bookingDate)) {
    return json({ error: 'Invalid bookingDate format. Use YYYY-MM-DD.' }, 400);
  }

  const bookingId = crypto.randomUUID();
  const cancelToken = crypto.randomUUID();
  const now = new Date().toISOString();
  const meetingLink = meetingLinkForType(payload.meetingType || 'zoom', env.ZOOM_MEETING_URL);
  const buyInDetected = detectBuyIn(payload);

  // Race-condition guard: double-booking prevention
  const conflict = await env.DB.prepare(
    "SELECT id FROM bookings WHERE booking_date = ? AND booking_time = ? AND status != 'cancelled'"
  ).bind(payload.bookingDate, payload.bookingTime).first();

  if (conflict) {
    return json({ error: 'This time slot was just taken. Please choose another.', code: 'SLOT_CONFLICT' }, 409);
  }

  // Insert booking into D1
  try {
    await env.DB.prepare(`
      INSERT INTO bookings (
        id, name, email, business_name, phone, service_type, industry, problem_summary,
        budget_range, timeline, ai_plan_summary, buy_in_detected, booking_date, booking_time,
        duration_minutes, meeting_type, meeting_link, ip_address, cancel_token, source, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      bookingId,
      payload.name.trim(),
      payload.email.toLowerCase().trim(),
      payload.businessName?.trim() || null,
      payload.phone?.trim() || null,
      payload.serviceType || null,
      payload.industry || null,
      payload.problemSummary?.trim() || null,
      payload.budgetRange || null,
      payload.timeline || null,
      payload.aiPlanSummary?.trim() || null,
      buyInDetected ? 1 : 0,
      payload.bookingDate,
      payload.bookingTime,
      payload.duration || 60,
      payload.meetingType || 'zoom',
      meetingLink || null,
      request.headers.get('cf-connecting-ip') || 'unknown',
      cancelToken,
      'mrtechsys_booking',
      now, now
    ).run();
  } catch (dbErr: any) {
    console.error('[booking-submit] D1 insert failed:', dbErr);
    return json({ error: 'Booking could not be recorded. Please try again.' }, 500);
  }

  // Attach cancel token and buy-in flag for email functions
  payload._cancelToken = cancelToken;
  payload._buyInDetected = buyInDetected;

  // Fire emails and CloudFlip bridge in parallel (non-blocking on failure)
  const [confirmSent, alertSent] = await Promise.all([
    sendUserConfirmation(env, payload, bookingId, meetingLink).catch(() => false),
    sendOwnerAlert(env, payload, bookingId).catch(() => false)
  ]);

  // CloudFlip bridge: smart path based on buy-in detection
  let cloudflipStatus = 'none';
  if (buyInDetected) {
    // Full OTP provisioning path
    const otpSent = await triggerCloudFlipOTP(env, payload, bookingId).catch(() => false);
    if (otpSent) {
      cloudflipStatus = 'otp_sent';
      await env.DB.prepare("UPDATE bookings SET cloudflip_provisioned = 1, cloudflip_otp_sent = 1 WHERE id = ?").bind(bookingId).run().catch(() => {});
    } else {
      // Fallback to invite if OTP fails
      const inviteSent = await sendCloudFlipInvite(env, payload).catch(() => false);
      if (inviteSent) {
        cloudflipStatus = 'invite_sent_fallback';
        await env.DB.prepare("UPDATE bookings SET cloudflip_invite_sent = 1 WHERE id = ?").bind(bookingId).run().catch(() => {});
      }
    }
  } else {
    // Non-pressured invite path
    const inviteSent = await sendCloudFlipInvite(env, payload).catch(() => false);
    if (inviteSent) {
      cloudflipStatus = 'invite_sent';
      await env.DB.prepare("UPDATE bookings SET cloudflip_invite_sent = 1 WHERE id = ?").bind(bookingId).run().catch(() => {});
    }
  }

  // Update confirmation flags
  await env.DB.prepare(
    "UPDATE bookings SET confirmation_sent = ?, owner_alert_sent = ? WHERE id = ?"
  ).bind(confirmSent ? 1 : 0, alertSent ? 1 : 0, bookingId).run().catch(() => {});

  return json({
    success: true,
    bookingId,
    message: 'Your strategy session is confirmed! Check your email for details.',
    date: payload.bookingDate,
    time: payload.bookingTime,
    meetingType: payload.meetingType,
    cloudflipStatus,
    timestamp: now
  });
};
