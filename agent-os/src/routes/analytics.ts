import { Hono } from "hono";
import type { Env } from "../types.js";
import { createSupabaseClient } from "../db.js";

export const analyticsRoutes = new Hono<{ Bindings: Env }>();

/**
 * GET /api/analytics/summary?tenant=demo
 * Returns a small rollup: order count, revenue, and active contacts.
 */
analyticsRoutes.get("/summary", async (c) => {
  const db = createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_KEY);
  const tenant = c.req.query("tenant") ?? undefined;

  let ordersQ = db.from("orders").select("total", { count: "exact" });
  if (tenant) ordersQ = ordersQ.eq("tenant", tenant);
  const { data: orders, count: orderCount, error } = await ordersQ;
  if (error) throw error;

  const revenue = (orders ?? []).reduce((sum, o: any) => sum + Number(o.total ?? 0), 0);

  let contactsQ = db.from("contacts").select("id", { count: "exact", head: true });
  if (tenant) contactsQ = contactsQ.eq("tenant", tenant);
  const { count: contactCount } = await contactsQ;

  return c.json({
    data: {
      tenant: tenant ?? "all",
      orders: orderCount ?? 0,
      revenue: Number(revenue.toFixed(2)),
      contacts: contactCount ?? 0,
    },
  });
});
