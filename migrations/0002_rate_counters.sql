-- Abuse limits for the public endpoints that email an address a visitor typed in (shared/rateLimit.ts).
-- One row per (bucket, fixed window); buckets are per IP, per recipient (SHA-256 of the address, never the address
-- itself) and site-wide. Rows older than two days are deleted as new requests arrive.
CREATE TABLE IF NOT EXISTS rate_counters (
  bucket TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket, window_start)
);
CREATE INDEX IF NOT EXISTS idx_rate_counters_window ON rate_counters(window_start);
