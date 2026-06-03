import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Create a Supabase client using the service_role key.
 *
 * This runs only inside the Worker, never in a browser. Row Level Security
 * stays enabled on every table; the service_role key is the single trusted
 * path that the API layer uses after it has authenticated the caller.
 */
export function createSupabaseClient(url: string, serviceKey: string): SupabaseClient {
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ── Generic data helpers ────────────────────────────────────
// In the real system these live in a shared `@db` package consumed by the
// worker and the Telegram handlers. Kept inline here for a self-contained demo.

export interface ContactFilter {
  tenant?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function listContacts(db: SupabaseClient, f: ContactFilter = {}) {
  let q = db.from("contacts").select("*", { count: "exact" });
  if (f.tenant) q = q.eq("tenant", f.tenant);
  if (f.search) q = q.ilike("first_name", `%${f.search}%`);
  q = q.order("created_at", { ascending: false });
  if (f.limit) q = q.range(f.offset ?? 0, (f.offset ?? 0) + f.limit - 1);
  const { data, error, count } = await q;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function getContact(db: SupabaseClient, id: string) {
  const { data, error } = await db.from("contacts").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createContact(db: SupabaseClient, body: Record<string, unknown>) {
  const { data, error } = await db.from("contacts").insert(body).select().single();
  if (error) throw error;
  return data;
}

export async function listOrders(db: SupabaseClient, f: { contact_id?: string; tenant?: string } = {}) {
  let q = db.from("orders").select("*", { count: "exact" });
  if (f.contact_id) q = q.eq("contact_id", f.contact_id);
  if (f.tenant) q = q.eq("tenant", f.tenant);
  q = q.order("created_at", { ascending: false });
  const { data, error, count } = await q;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

/** Mark conversation sessions inactive after their TTL — called from cron. */
export async function expireSessions(db: SupabaseClient): Promise<number> {
  const cutoff = new Date(Date.now() - 30 * 60_000).toISOString();
  const { data, error } = await db
    .from("sessions")
    .update({ active: false })
    .lt("last_seen_at", cutoff)
    .eq("active", true)
    .select("id");
  if (error) throw error;
  return data?.length ?? 0;
}
