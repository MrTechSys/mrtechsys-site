-- mrtechsys-site-db: the marketing site's own tables, moved off CloudFlip's production database (cloudflip-db).
-- Schemas copied exactly from cloudflip-db on 2026-10-22 so the data copies over unchanged.

CREATE TABLE audit_logs (id TEXT PRIMARY KEY, tenant_id TEXT, user_id TEXT, action TEXT, resource TEXT, metadata TEXT, ip_address TEXT, created_at TEXT);

CREATE TABLE booking_availability (
  id TEXT PRIMARY KEY,
  day_of_week INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  slot_duration_options TEXT DEFAULT '["30","45","60"]',
  buffer_minutes INTEGER DEFAULT 15,
  timezone TEXT DEFAULT 'America/Chicago',
  max_daily_bookings INTEGER DEFAULT 8,
  advance_notice_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT 1,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
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
  timezone TEXT DEFAULT 'America/Chicago',
  meeting_type TEXT DEFAULT 'zoom',
  meeting_link TEXT,
  status TEXT DEFAULT 'confirmed',
  cancelled_at TEXT,
  cancellation_reason TEXT,
  rescheduled_from TEXT,
  cloudflip_tenant_id TEXT,
  cloudflip_provisioned BOOLEAN DEFAULT 0,
  cloudflip_invite_sent BOOLEAN DEFAULT 0,
  cloudflip_otp_sent BOOLEAN DEFAULT 0,
  confirmation_sent BOOLEAN DEFAULT 0,
  owner_alert_sent BOOLEAN DEFAULT 0,
  ip_address TEXT,
  cancel_token TEXT,
  source TEXT DEFAULT 'mrtechsys_booking'
);

CREATE INDEX idx_bookings_date_status ON bookings(booking_date, status);

CREATE INDEX idx_bookings_email ON bookings(email);

CREATE INDEX idx_bookings_cancel_token ON bookings(cancel_token);

CREATE TABLE business_technology_profiles (
  id TEXT PRIMARY KEY,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  business_name TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  industry TEXT,
  team_size TEXT,
  raw_dialogue_json TEXT,
  extracted_state_json TEXT,
  health_score INTEGER,
  operations_score INTEGER,
  security_score INTEGER,
  technology_score INTEGER,
  data_score INTEGER,
  cx_score INTEGER,
  financial_score INTEGER,
  continuity_score INTEGER,
  identified_inefficiencies_json TEXT,
  estimated_annual_savings_min INTEGER DEFAULT 1200,
  estimated_annual_savings_max INTEGER DEFAULT 3600,
  estimated_hours_recovered_min INTEGER DEFAULT 5,
  estimated_hours_recovered_max INTEGER DEFAULT 12,
  now_actions_json TEXT,
  next_actions_json TEXT,
  later_actions_json TEXT,
  recommended_routes_json TEXT,
  consultation_booked BOOLEAN DEFAULT 0,
  pre_call_brief_generated BOOLEAN DEFAULT 0,
  pre_call_brief_text TEXT
);

CREATE INDEX idx_btp_email ON business_technology_profiles(contact_email);

CREATE TABLE telemetry_events (id TEXT PRIMARY KEY, timestamp TEXT, ip TEXT, country TEXT, user_agent TEXT, path TEXT, method TEXT, response_status INTEGER, duration_ms INTEGER, bot_score INTEGER, tenant_id TEXT, user_id TEXT, component_id TEXT, action_type TEXT, metadata TEXT);

