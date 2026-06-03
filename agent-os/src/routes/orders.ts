import { Hono } from "hono";
import type { Env } from "../types.js";
import { createSupabaseClient, listOrders } from "../db.js";

export const ordersRoutes = new Hono<{ Bindings: Env }>();

const db = (c: { env: Env }) =>
  createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_KEY);

// GET /api/orders → list, optionally filtered by tenant
ordersRoutes.get("/", async (c) => {
  const result = await listOrders(db(c), { tenant: c.req.query("tenant") ?? undefined });
  return c.json(result);
});

// POST /api/orders → create an order
ordersRoutes.post("/", async (c) => {
  const body = await c.req.json();
  if (!body.contact_id || !Array.isArray(body.items) || body.items.length === 0) {
    return c.json({ error: "contact_id and a non-empty items array are required" }, 400);
  }
  const { data, error } = await db(c).from("orders").insert(body).select().single();
  if (error) throw error;
  return c.json({ data }, 201);
});
