-- Supabase Postgres Schema for Botlock AI Paywall

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Payments Analytics ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id              BIGSERIAL PRIMARY KEY,
  tx              TEXT NOT NULL UNIQUE,
  wallet_address  TEXT NOT NULL,
  network         TEXT NOT NULL,
  bot_name        TEXT,
  user_agent      TEXT,
  path            TEXT,
  page_hash       TEXT,
  lamports        BIGINT,
  relevance_score INTEGER,
  content_type    TEXT,
  bot_multiplier  DOUBLE PRECISION,
  exclusivity_mod DOUBLE PRECISION,
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index optimizations for analytical reads and filters
CREATE INDEX IF NOT EXISTS payments_timestamp_idx ON public.payments (timestamp DESC);
CREATE INDEX IF NOT EXISTS payments_path_idx      ON public.payments (path);
CREATE INDEX IF NOT EXISTS payments_bot_name_idx  on public.payments (bot_name);
CREATE INDEX IF NOT EXISTS payments_wallet_idx    ON public.payments (wallet_address);

-- ─── Verified Transaction Cache (Replay Protection) ──────────────────────────
CREATE TABLE IF NOT EXISTS public.verified_tx_cache (
  tx              TEXT PRIMARY KEY,
  wallet_address  TEXT NOT NULL,
  cached_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index optimization to query and manage transaction validations
CREATE INDEX IF NOT EXISTS verified_tx_cache_wallet_idx ON public.verified_tx_cache (wallet_address);
