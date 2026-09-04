# Architecture & API Reference · mrtechsys.com

This document describes the serverless edge architecture, database schema, routing logic, and inter-system integrations for `mrtechsys-site`.

---

## 1. Cloudflare Pages Functions & API Routes

All functions live under `/functions/` and are automatically served as serverless endpoints by Cloudflare Pages.

| Endpoint | Method | File | Purpose | Whitelisted in Middleware? |
|---|---|---|---|---|
| `/api/booking-availability` | `GET` | `functions/api/booking-availability.ts` | Calculates real-time slot availability for a date/duration | Yes |
| `/api/booking-submit` | `POST` | `functions/api/booking-submit.ts` | Records booking, sends Resend emails, bridges to CloudFlip | Yes |
| `/api/booking-cancel` | `GET` | `functions/api/booking-cancel.ts` | 1-click tokenized cancellation link handler | Yes |
| `/api/mrtechsysgpt` | `POST` | `functions/api/mrtechsysgpt.ts` | AI conversational advisor (Workers AI Llama 3) | Yes |
| `/api/blueprint-submit` | `POST` | `functions/api/blueprint-submit.ts` | Cloud Provisioner lead capture + playbook email dispatch | Yes |
| `/api/consult-submit` | `POST` | `functions/api/consult-submit.ts` | Consultation modal lead recording into D1 inbox | Yes |
| `/api/leads` | `GET` | `functions/api/leads.ts` | Admin inquiry stream | Requires Auth |

---

## 2. Middleware & Security Architecture (`functions/_middleware.ts`)

- **Edge IP & Bot Filtering**: Low bot score requests (< 30) are automatically throttled unless targeting public whitelist routes.
- **Whitelist Routes**:
  ```ts
  const isPublicRoute =
    url.pathname.includes("mrtechsysgpt") ||
    url.pathname.includes("blueprint-submit") ||
    url.pathname.includes("consult-submit") ||
    url.pathname.includes("booking-availability") ||
    url.pathname.includes("booking-submit") ||
    url.pathname.includes("booking-cancel") ||
    url.pathname.startsWith("/api/public");
  ```
- **Security Headers Injected**:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Telemetry Ingestion**: Every HTTP request emits telemetry to the `telemetry_events` table in Cloudflare D1.

---

## 3. Database Schema (`cloudflip-db`)

The site connects to D1 database `cloudflip-db` (`03af9f85-87c2-4473-a073-872c0dcb84c5`).

### `booking_availability` Table
Stores schedule rules:
```sql
CREATE TABLE booking_availability (
  id TEXT PRIMARY KEY,
  day_of_week INTEGER NOT NULL,          -- 0=Sun, 1=Mon ... 6=Sat
  start_time TEXT NOT NULL,              -- "09:00" (CST)
  end_time TEXT NOT NULL,                -- "19:00"
  slot_duration_options TEXT,            -- '["30","45","60"]'
  buffer_minutes INTEGER DEFAULT 15,     -- 15m break between slots
  timezone TEXT DEFAULT 'America/Chicago',
  max_daily_bookings INTEGER DEFAULT 8,
  advance_notice_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT 1,
  updated_at TEXT DEFAULT (datetime('now'))
);
```

### `bookings` Table
Stores confirmed appointments and contextual diagnostics:
```sql
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  business_name TEXT,
  phone TEXT,
  service_type TEXT,
  industry TEXT,
  problem_summary TEXT,
  budget_range TEXT,
  timeline TEXT,
  ai_plan_summary TEXT,
  buy_in_detected BOOLEAN DEFAULT 0,
  booking_date TEXT NOT NULL,
  booking_time TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  meeting_type TEXT DEFAULT 'zoom',
  meeting_link TEXT,
  status TEXT DEFAULT 'confirmed',
  cloudflip_tenant_id TEXT,
  cloudflip_provisioned BOOLEAN DEFAULT 0,
  cloudflip_invite_sent BOOLEAN DEFAULT 0,
  cloudflip_otp_sent BOOLEAN DEFAULT 0,
  confirmation_sent BOOLEAN DEFAULT 0,
  owner_alert_sent BOOLEAN DEFAULT 0,
  cancel_token TEXT,
  source TEXT DEFAULT 'mrtechsys_booking',
  created_at TEXT DEFAULT (datetime('now'))
);
```

---

## 4. CloudFlip OS Auto-Provisioning Bridge

When a booking is confirmed on `mrtechsys.com`, the serverless worker triggers an internal server-to-server request:
```
POST https://cloudflip.mrtechsys.com/api/auth/signup
Headers:
  X-Internal-Provision-Token: <CLOUDFLIP_PROVISION_SECRET>
Body:
  {
    email,
    businessName,
    vertical,
    _bypass_turnstile: true
  }
```

CloudFlip's route handler (`functions/api/[[route]].js`) verifies the internal token and bypasses the client-side Turnstile challenge, allowing automated tenant and user bootstrapping without human intervention.
