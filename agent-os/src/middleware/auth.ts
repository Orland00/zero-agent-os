import { createMiddleware } from "hono/factory";
import type { Env } from "../types.js";

/**
 * Bearer-token auth for /api/*.
 *
 * Public paths (health check, webhooks, cron triggers) are exempt because they
 * are verified by other means — webhook signatures and a secret path prefix.
 */
export const authMiddleware = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const path = new URL(c.req.url).pathname;

  if (path === "/health" || path.startsWith("/webhooks/") || path.startsWith("/cron/")) {
    return next();
  }

  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = header.slice(7);
  if (token !== c.env.ADMIN_TOKEN) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
});
