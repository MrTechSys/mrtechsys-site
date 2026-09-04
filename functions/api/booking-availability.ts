// functions/api/booking-availability.ts
// GET /api/booking-availability?date=YYYY-MM-DD&duration=60

interface Env {
  DB?: D1Database;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function generateSlots(startTime: string, endTime: string, durationMin: number, bufferMin: number): string[] {
  const slots: string[] = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;
  const step = durationMin + bufferMin;
  for (let t = startTotal; t + durationMin <= endTotal; t += step) {
    const h = Math.floor(t / 60).toString().padStart(2, '0');
    const m = (t % 60).toString().padStart(2, '0');
    slots.push(`${h}:${m}`);
  }
  return slots;
}

function formatDisplayTime(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm} CST`;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  const url = new URL(request.url);
  const date = url.searchParams.get('date');
  const requestedDuration = parseInt(url.searchParams.get('duration') || '60', 10);

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: 'Invalid date. Use YYYY-MM-DD.' }, 400);
  if (![30, 45, 60].includes(requestedDuration)) return json({ error: 'Invalid duration. Allowed: 30, 45, 60.' }, 400);
  if (!env.DB) return json({ error: 'Database unavailable.' }, 503);

  try {
    const dayOfWeek = new Date(date + 'T18:00:00Z').getUTCDay();
    const avail = await env.DB.prepare('SELECT * FROM booking_availability WHERE day_of_week = ? AND is_active = 1').bind(dayOfWeek).first() as any;
    if (!avail) return json({ available: false, reason: 'Not a working day.', slots: [] });

    const advanceHours = avail.advance_notice_hours ?? 24;
    const targetDate = new Date(date + 'T00:00:00-06:00');
    const hoursUntil = (targetDate.getTime() - Date.now()) / 3600000;
    if (hoursUntil < advanceHours) return json({ available: false, reason: `Minimum ${advanceHours}h advance notice required.`, slots: [] });

    const { results: booked } = await env.DB.prepare("SELECT booking_time, duration_minutes FROM bookings WHERE booking_date = ? AND status != 'cancelled'").bind(date).all() as { results: Array<{ booking_time: string; duration_minutes: number }> };
    const maxDaily = avail.max_daily_bookings ?? 8;
    if (booked.length >= maxDaily) return json({ available: false, reason: 'Date is fully booked.', slots: [] });

    const buffer = avail.buffer_minutes ?? 15;
    const blockedMinutes = new Set<number>();
    for (const b of booked) {
      const [bh, bm] = b.booking_time.split(':').map(Number);
      const bStart = bh * 60 + bm;
      const bEnd = bStart + b.duration_minutes + buffer;
      for (let t = bStart; t < bEnd; t++) blockedMinutes.add(t);
    }

    const allSlots = generateSlots(avail.start_time, avail.end_time, requestedDuration, buffer);
    const slots = allSlots.map(slot => {
      const [h, m] = slot.split(':').map(Number);
      const slotStart = h * 60 + m;
      const slotEnd = slotStart + requestedDuration;
      let isBlocked = false;
      for (let t = slotStart; t < slotEnd; t++) { if (blockedMinutes.has(t)) { isBlocked = true; break; } }
      return { time: slot, label: formatDisplayTime(slot), available: !isBlocked };
    }).filter(s => s.available);

    return json({ available: slots.length > 0, date, duration: requestedDuration, timezone: avail.timezone, slots, booked_count: booked.length, max_daily: maxDaily });
  } catch (err: any) {
    console.error('[booking-availability]', err);
    return json({ error: 'Internal error.' }, 500);
  }
};
