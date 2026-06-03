import { Hono } from "hono";
import type { Env } from "../types.js";
import {
  createSupabaseClient,
  listContacts,
  getContact,
  createContact,
  listOrders,
} from "../db.js";

export const contactsRoutes = new Hono<{ Bindings: Env }>();

const db = (c: { env: Env }) =>
  createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_KEY);

// GET /api/contacts → list with filters
contactsRoutes.get("/", async (c) => {
  const result = await listContacts(db(c), {
    tenant: c.req.query("tenant") ?? undefined,
    search: c.req.query("search") ?? undefined,
    limit: c.req.query("limit") ? Number(c.req.query("limit")) : undefined,
    offset: c.req.query("offset") ? Number(c.req.query("offset")) : undefined,
  });
  return c.json(result);
});

// GET /api/contacts/:id
contactsRoutes.get("/:id", async (c) => {
  const data = await getContact(db(c), c.req.param("id"));
  return c.json({ data });
});

// POST /api/contacts
contactsRoutes.post("/", async (c) => {
  const body = await c.req.json();
  if (!body.phone && !body.telegram_chat_id) {
    return c.json({ error: "Either phone or telegram_chat_id is required" }, 400);
  }
  if (body.phone && !String(body.phone).startsWith("+")) {
    return c.json({ error: "Phone must be E.164 format (start with +)" }, 400);
  }
  const data = await createContact(db(c), body);
  return c.json({ data }, 201);
});

// GET /api/contacts/:id/orders
contactsRoutes.get("/:id/orders", async (c) => {
  const result = await listOrders(db(c), { contact_id: c.req.param("id") });
  return c.json(result);
});
