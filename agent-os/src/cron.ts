import type { Env } from "./types.js";
import { createSupabaseClient, expireSessions } from "./db.js";

/**
 * Scheduled handler — dispatches to a job based on the cron expression that
 * fired it. Schedules are declared in wrangler.toml under [triggers].
 */
export async function handleScheduled(event: ScheduledEvent, env: Env): Promise<void> {
  console.log(`[cron] ${event.cron} @ ${new Date(event.scheduledTime).toISOString()}`);

  switch (event.cron) {
    case "*/15 * * * *":
      await cronExpireSessions(env);
      await cronDigest(env);
      break;
    default:
      console.warn(`[cron] No job bound to schedule: ${event.cron}`);
  }
}

async function cronExpireSessions(env: Env): Promise<void> {
  const db = createSupabaseClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
  try {
    const count = await expireSessions(db);
    if (count > 0) console.log(`[cron] Expired ${count} stale sessions`);
  } catch (err) {
    console.error("[cron] Session expiry error:", err);
  }
}

/** Example periodic job: roll up today's orders. Extend per tenant. */
async function cronDigest(env: Env): Promise<void> {
  const db = createSupabaseClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
  const since = new Date(Date.now() - 24 * 3_600_000).toISOString();
  const { count } = await db
    .from("orders")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since);
  console.log(`[cron] Orders in last 24h: ${count ?? 0}`);
}
