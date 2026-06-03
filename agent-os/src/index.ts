import { Hono } from "hono";
import type { Env } from "./types.js";
import { corsMiddleware } from "./middleware/cors.js";
import { errorMiddleware } from "./middleware/errors.js";
import { authMiddleware } from "./middleware/auth.js";
import { rateLimit } from "./middleware/rate-limit.js";
import { contactsRoutes } from "./routes/contacts.js";
import { ordersRoutes } from "./routes/orders.js";
import { analyticsRoutes } from "./routes/analytics.js";
import { webhooksApp } from "./telegram.js";
import { dashboardApp } from "./dashboard.js";
import { handleScheduled } from "./cron.js";

const app = new Hono<{ Bindings: Env }>();

// ── Global middleware ───────────────────────────────────
app.use("*", corsMiddleware);
app.use("*", errorMiddleware);

// Global per-IP rate limit (120 req/min). Webhooks (signature-verified) and
// health checks are exempt; stricter per-endpoint limits can stack on top.
app.use("*", rateLimit({ limit: 120, windowSec: 60, prefix: "global", skip: ["/webhooks/", "/cron/", "/health"] }));

// ── Public routes ───────────────────────────────────────
app.get("/", (c) => c.redirect("/os/", 302));
app.get("/health", (c) => c.json({ ok: true, timestamp: new Date().toISOString() }));

app.get("/os", (c) => c.redirect("/os/", 301));
app.mount("/os", dashboardApp.fetch);

// Webhooks — no bearer auth; verified by signature/secret token instead.
app.route("/webhooks", webhooksApp);

// ── API routes (bearer auth) ────────────────────────────
app.use("/api/*", authMiddleware);
app.route("/api/contacts", contactsRoutes);
app.route("/api/orders", ordersRoutes);
app.route("/api/analytics", analyticsRoutes);

app.notFound((c) => c.json({ error: "Not found" }, 404));

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(handleScheduled(event, env));
  },
};
