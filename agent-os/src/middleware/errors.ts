import { createMiddleware } from "hono/factory";
import type { Env } from "../types.js";

/** Global error handler — converts thrown errors into a 500 JSON response. */
export const errorMiddleware = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  try {
    await next();
  } catch (err) {
    console.error("[agent-os] Unhandled error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});
