/**
 * Worker bindings. All secrets are injected at runtime via
 * `wrangler secret put` (deployed environments) or `.dev.vars` (local).
 * No values are ever committed.
 */
export interface Env {
  // Supabase (service_role key — server-side only, never shipped to a client)
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;

  // Bearer token guarding /api/*
  ADMIN_TOKEN: string;

  // Telegram bot (webhook mode)
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_WEBHOOK_SECRET: string;

  // KV namespace backing the rate limiter (optional — limiter no-ops if unbound)
  RATE_LIMIT_KV?: KVNamespace;
}

export type ApiError = { error: string; code?: string };
export type ApiList<T> = { data: T[]; count: number };
export type ApiItem<T> = { data: T };
