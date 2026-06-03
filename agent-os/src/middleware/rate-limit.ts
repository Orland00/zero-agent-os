import { createMiddleware } from "hono/factory";
import type { Env } from "../types.js";

/**
 * Per-IP fixed-window rate limiter backed by a KV namespace.
 *
 * Degrades gracefully (allows the request) when KV is unbound, so the worker
 * never hard-fails on a missing namespace in local dev.
 */
export function rateLimit(opts: {
  limit: number;
  windowSec: number;
  prefix: string;
  skip?: string[];
}) {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const kv = c.env.RATE_LIMIT_KV;
    if (!kv) return next();

    const path = new URL(c.req.url).pathname;
    if (opts.skip?.some((p) => path === p || path.startsWith(p))) return next();

    const ip =
      c.req.header("CF-Connecting-IP") ||
      c.req.header("X-Forwarded-For")?.split(",")[0].trim() ||
      "unknown";

    const key = `rl:${opts.prefix}:${ip}`;
    const count = parseInt((await kv.get(key)) || "0", 10);
    if (count >= opts.limit) {
      return c.json({ error: "Too many requests" }, 429);
    }
    await kv.put(key, String(count + 1), { expirationTtl: opts.windowSec });

    await next();
  });
}
